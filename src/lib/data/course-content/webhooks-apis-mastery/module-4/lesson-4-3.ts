import { Lesson } from '@/lib/data/courses';

export const lesson4_3: Lesson = {
  id: 'legacy-system-integration',
  title: 'Legacy system integratie',
  duration: '35 min',
  content: `# Legacy system integratie

## De realiteit van legacy systemen

In veel organisaties draaien kritieke processen nog op legacy systemen. Als developer moet je vaak moderne applicaties koppelen aan deze oudere technologieën:

• **SOAP services** uit het pre-REST tijdperk
• **FTP/SFTP servers** voor file-based data exchange
• **Direct database access** naar legacy databases
• **File-based integrations** via gedeelde folders
• **Proprietary protocols** en custom formats

Het doel is niet om deze systemen te vervangen, maar om ze effectief te integreren met moderne architectuur.

## SOAP services integratie

SOAP (Simple Object Access Protocol) was de standaard voor web services voor REST populair werd. Veel enterprise systemen gebruiken nog steeds SOAP:

**Kenmerken van SOAP:**
• XML-based protocol met strikte schema's
• WSDL (Web Services Description Language) voor service definitie
• WS-Security voor enterprise-grade security
• Stateful operations mogelijk
• Complex maar krachtig voor enterprise scenarios

**SOAP vs REST vergelijking:**
\`\`\`
SOAP:
- Protocol: HTTP, SMTP, TCP
- Format: Alleen XML
- Security: WS-Security
- State: Stateful/Stateless
- Schema: WSDL

REST:
- Protocol: Alleen HTTP
- Format: JSON, XML, etc.
- Security: HTTPS, OAuth
- State: Stateless
- Schema: OpenAPI (optional)
\`\`\`

**Tools voor SOAP development:**
• SoapUI - Testing en mocking
• Postman - Ondersteunt ook SOAP
• WSDL2Code generators
• Node.js: soap, strong-soap packages

## SOAP client implementatie

Moderne SOAP client implementatie in Node.js:

\`\`\`javascript
const soap = require('soap');
const { promisify } = require('util');

class LegacySOAPClient {
  constructor(wsdlUrl, options = {}) {
    this.wsdlUrl = wsdlUrl;
    this.options = {
      // Basic auth indien nodig
      wsdl_options: {
        auth: options.auth,
        strictSSL: false // Voor self-signed certificates
      },
      // Extra SOAP headers
      extraHeaders: options.headers || {}
    };
    this.client = null;
  }

  async initialize() {
    try {
      // Create SOAP client from WSDL
      const createClient = promisify(soap.createClient);
      this.client = await createClient(this.wsdlUrl, this.options.wsdl_options);
      
      // Add custom headers indien nodig
      if (this.options.extraHeaders) {
        this.client.addSoapHeader(this.options.extraHeaders);
      }
      
      // Enable WS-Security indien nodig
      if (this.options.wsSecurity) {
        const { username, password } = this.options.wsSecurity;
        this.client.setSecurity(
          new soap.WSSecurity(username, password)
        );
      }
      
      console.log('SOAP client initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize SOAP client:', error);
      throw error;
    }
  }

  // Generic method caller
  async callMethod(methodName, args) {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    try {
      // Promisify the method
      const method = promisify(this.client[methodName]).bind(this.client);
      
      // Call with timeout
      const result = await Promise.race([
        method(args),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SOAP call timeout')), 30000)
        )
      ]);

      return this.parseSOAPResponse(result);
    } catch (error) {
      console.error(\`SOAP method \${methodName} failed:\`, error);
      throw this.handleSOAPError(error);
    }
  }

  parseSOAPResponse(response) {
    // SOAP responses zijn vaak genest
    if (response && response.return) {
      return response.return;
    }
    return response;
  }

  handleSOAPError(error) {
    // Transform SOAP faults naar leesbare errors
    if (error.root && error.root.Envelope) {
      const fault = error.root.Envelope.Body.Fault;
      return new Error(\`SOAP Fault: \${fault.faultstring}\`);
    }
    return error;
  }

  // Voorbeeld: Customer lookup
  async getCustomer(customerId) {
    return this.callMethod('GetCustomer', {
      customerId: customerId,
      includeOrders: true
    });
  }
}

// Usage
const client = new LegacySOAPClient('http://legacy.company.com/soap?wsdl', {
  auth: {
    username: process.env.SOAP_USER,
    password: process.env.SOAP_PASS
  },
  wsSecurity: {
    username: process.env.WS_USER,
    password: process.env.WS_PASS
  }
});

await client.initialize();
const customer = await client.getCustomer('12345');
\`\`\`

## FTP/SFTP integratie

File Transfer Protocol blijft een veelgebruikte methode voor batch data exchange:

\`\`\`javascript
const Client = require('ssh2-sftp-client');
const chokidar = require('chokidar');
const path = require('path');

class LegacyFileIntegration {
  constructor(config) {
    this.sftp = new Client();
    this.config = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
      password: config.password,
      // of gebruik privateKey
      privateKey: config.privateKey,
      retries: 3,
      retry_factor: 2,
      retry_minTimeout: 2000
    };
    this.localPath = config.localPath || './downloads';
    this.remotePath = config.remotePath || '/';
  }

  async connect() {
    try {
      await this.sftp.connect(this.config);
      console.log('SFTP connection established');
    } catch (error) {
      console.error('SFTP connection failed:', error);
      throw error;
    }
  }

  async downloadFiles(pattern = '*') {
    try {
      const files = await this.sftp.list(this.remotePath);
      
      // Filter files based on pattern
      const matchingFiles = files.filter(file => {
        if (file.type !== '-') return false; // Only files
        if (pattern === '*') return true;
        return file.name.match(new RegExp(pattern));
      });

      console.log(\`Found \${matchingFiles.length} files to download\`);

      for (const file of matchingFiles) {
        await this.downloadFile(file);
      }

      return matchingFiles;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  async downloadFile(file) {
    const remotePath = path.join(this.remotePath, file.name);
    const localPath = path.join(this.localPath, file.name);
    const tempPath = \`\${localPath}.downloading\`;

    try {
      // Download to temp file first
      await this.sftp.fastGet(remotePath, tempPath);
      
      // Verify file integrity
      const stats = await this.sftp.stat(remotePath);
      const localStats = require('fs').statSync(tempPath);
      
      if (stats.size !== localStats.size) {
        throw new Error('File size mismatch - corrupt download');
      }

      // Rename to final name
      require('fs').renameSync(tempPath, localPath);
      
      // Archive on remote server
      await this.archiveRemoteFile(file.name);
      
      console.log(\`Downloaded: \${file.name}\`);
      return localPath;
    } catch (error) {
      // Cleanup temp file
      if (require('fs').existsSync(tempPath)) {
        require('fs').unlinkSync(tempPath);
      }
      throw error;
    }
  }

  async archiveRemoteFile(filename) {
    const source = path.join(this.remotePath, filename);
    const archive = path.join(this.remotePath, 'archive', filename);
    
    try {
      await this.sftp.mkdir(path.join(this.remotePath, 'archive'), true);
      await this.sftp.rename(source, archive);
    } catch (error) {
      console.warn('Failed to archive file:', error);
    }
  }

  // File watcher voor real-time processing
  watchIncomingFiles(processor) {
    const watcher = chokidar.watch(this.localPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    watcher
      .on('add', async (filePath) => {
        console.log(\`Processing new file: \${filePath}\`);
        try {
          await processor(filePath);
          // Move to processed folder
          const processedPath = filePath.replace('/downloads/', '/processed/');
          require('fs').renameSync(filePath, processedPath);
        } catch (error) {
          console.error(\`Failed to process \${filePath}:\`, error);
          // Move to error folder
          const errorPath = filePath.replace('/downloads/', '/errors/');
          require('fs').renameSync(filePath, errorPath);
        }
      })
      .on('error', error => console.error('Watcher error:', error));

    return watcher;
  }

  async disconnect() {
    await this.sftp.end();
  }
}

// Usage
const fileIntegration = new LegacyFileIntegration({
  host: 'legacy.company.com',
  username: process.env.SFTP_USER,
  password: process.env.SFTP_PASS,
  remotePath: '/outbound/orders',
  localPath: './data/downloads'
});

await fileIntegration.connect();

// Download en process files
const files = await fileIntegration.downloadFiles('*.xml');

// Watch voor nieuwe files
const watcher = fileIntegration.watchIncomingFiles(async (filePath) => {
  const content = require('fs').readFileSync(filePath, 'utf8');
  // Process file content
  await processLegacyOrder(content);
});
\`\`\`

## Direct database access

Soms is directe database toegang de enige optie:

\`\`\`javascript
const oracledb = require('oracledb');
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

class LegacyDatabaseAdapter {
  constructor(config) {
    this.dbType = config.type; // 'oracle', 'mysql', 'postgres'
    this.config = config;
    this.connection = null;
    this.pool = null;
  }

  async connect() {
    switch (this.dbType) {
      case 'oracle':
        await this.connectOracle();
        break;
      case 'mysql':
        await this.connectMySQL();
        break;
      case 'postgres':
        await this.connectPostgres();
        break;
      default:
        throw new Error(\`Unsupported database type: \${this.dbType}\`);
    }
  }

  async connectOracle() {
    // Oracle client configuratie
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.autoCommit = true;
    
    this.pool = await oracledb.createPool({
      user: this.config.user,
      password: this.config.password,
      connectString: this.config.connectString,
      poolMin: 2,
      poolMax: 10,
      poolTimeout: 60
    });
    
    console.log('Oracle connection pool created');
  }

  async connectMySQL() {
    this.pool = await mysql.createPool({
      host: this.config.host,
      port: this.config.port || 3306,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('MySQL connection pool created');
  }

  async connectPostgres() {
    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port || 5432,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });
    
    console.log('PostgreSQL connection pool created');
  }

  // Generic query executor with retries
  async executeQuery(sql, params = [], options = {}) {
    const maxRetries = options.retries || 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.performQuery(sql, params);
      } catch (error) {
        lastError = error;
        console.error(\`Query attempt \${attempt} failed:\`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError;
  }

  async performQuery(sql, params) {
    let connection;
    
    try {
      switch (this.dbType) {
        case 'oracle':
          connection = await this.pool.getConnection();
          const result = await connection.execute(sql, params);
          return result.rows;
          
        case 'mysql':
          const [rows] = await this.pool.execute(sql, params);
          return rows;
          
        case 'postgres':
          const pgResult = await this.pool.query(sql, params);
          return pgResult.rows;
          
        default:
          throw new Error('Unsupported database type');
      }
    } finally {
      // Release connection back to pool
      if (connection && this.dbType === 'oracle') {
        await connection.close();
      }
    }
  }

  // Data mapping helpers
  mapLegacyData(rows, mapping) {
    return rows.map(row => {
      const mapped = {};
      
      for (const [newKey, oldKey] of Object.entries(mapping)) {
        // Handle nested mappings
        if (typeof oldKey === 'function') {
          mapped[newKey] = oldKey(row);
        } else if (oldKey.includes('.')) {
          // Handle joined table fields
          const parts = oldKey.split('.');
          mapped[newKey] = row[parts.join('_')];
        } else {
          mapped[newKey] = row[oldKey];
        }
      }
      
      return mapped;
    });
  }

  // Batch operations for performance
  async batchInsert(table, records, batchSize = 1000) {
    const batches = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    const results = [];
    
    for (const batch of batches) {
      const result = await this.performBatchInsert(table, batch);
      results.push(result);
    }

    return results;
  }

  async performBatchInsert(table, records) {
    if (records.length === 0) return;

    const columns = Object.keys(records[0]);
    const placeholders = this.getPlaceholders(columns.length, records.length);
    
    const sql = \`
      INSERT INTO \${table} (\${columns.join(', ')})
      VALUES \${placeholders}
    \`;

    const values = records.flatMap(record => 
      columns.map(col => record[col])
    );

    return this.executeQuery(sql, values);
  }

  getPlaceholders(columnCount, rowCount) {
    const rowPlaceholder = \`(\${Array(columnCount).fill('?').join(', ')})\`;
    return Array(rowCount).fill(rowPlaceholder).join(', ');
  }

  // Clean disconnect
  async disconnect() {
    if (this.pool) {
      switch (this.dbType) {
        case 'oracle':
          await this.pool.close(10);
          break;
        case 'mysql':
          await this.pool.end();
          break;
        case 'postgres':
          await this.pool.end();
          break;
      }
    }
  }
}

// Usage example
const legacyDB = new LegacyDatabaseAdapter({
  type: 'oracle',
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASS,
  connectString: 'legacy.company.com:1521/PROD'
});

await legacyDB.connect();

// Query legacy data
const customers = await legacyDB.executeQuery(
  'SELECT * FROM LEGACY_CUSTOMERS WHERE CREATED_DATE > :1',
  [new Date('2024-01-01')]
);

// Map to modern format
const mappedCustomers = legacyDB.mapLegacyData(customers, {
  id: 'CUST_ID',
  name: 'CUST_NAME',
  email: 'EMAIL_ADDR',
  createdAt: row => new Date(row.CREATED_DATE),
  isActive: row => row.STATUS === 'A'
});

await legacyDB.disconnect();
\`\`\`

## Architectuur patterns voor legacy integratie

### 1. Anti-corruption Layer Pattern

Bescherm je moderne applicatie tegen legacy complexiteit:

\`\`\`javascript
// Anti-corruption layer implementatie
class LegacySystemFacade {
  constructor() {
    this.soapClient = new LegacySOAPClient(config.soap);
    this.fileIntegration = new LegacyFileIntegration(config.ftp);
    this.database = new LegacyDatabaseAdapter(config.db);
  }

  async initialize() {
    await Promise.all([
      this.soapClient.initialize(),
      this.fileIntegration.connect(),
      this.database.connect()
    ]);
  }

  // Unified interface voor moderne applicatie
  async getCustomerData(customerId) {
    try {
      // Gather data from multiple legacy sources
      const [soapData, dbData] = await Promise.all([
        this.soapClient.getCustomer(customerId),
        this.database.executeQuery(
          'SELECT * FROM CUSTOMERS WHERE ID = ?',
          [customerId]
        )
      ]);

      // Check for file-based updates
      const fileUpdates = await this.checkFileUpdates(customerId);

      // Merge and transform to modern format
      return this.transformToModernFormat({
        soap: soapData,
        database: dbData[0],
        files: fileUpdates
      });
    } catch (error) {
      // Transform legacy errors to modern errors
      throw this.transformError(error);
    }
  }

  transformToModernFormat(legacyData) {
    // Complex transformation logic
    return {
      id: legacyData.database.ID,
      profile: {
        name: legacyData.soap.CustomerName,
        email: legacyData.database.EMAIL,
        phone: legacyData.soap.ContactInfo?.Phone
      },
      preferences: this.parsePreferences(legacyData.files),
      lastUpdated: new Date()
    };
  }

  transformError(legacyError) {
    // Map legacy errors to modern error types
    if (legacyError.code === 'ORA-00001') {
      return new DuplicateKeyError('Customer already exists');
    }
    if (legacyError.message?.includes('SOAP-ENV:Fault')) {
      return new ServiceUnavailableError('Legacy service unavailable');
    }
    return new Error(\`Legacy system error: \${legacyError.message}\`);
  }
}
\`\`\`

### 2. Strangler Fig Pattern

Geleidelijke vervanging van legacy functionaliteit:

\`\`\`javascript
class ModernizationRouter {
  constructor() {
    this.routes = new Map();
    this.modernizedEndpoints = new Set();
  }

  // Register endpoints met migration percentage
  register(endpoint, { legacy, modern, percentage = 0 }) {
    this.routes.set(endpoint, {
      legacy,
      modern,
      percentage
    });
  }

  // Route traffic based on migration status
  async handleRequest(endpoint, ...args) {
    const route = this.routes.get(endpoint);
    
    if (!route) {
      throw new Error(\`Unknown endpoint: \${endpoint}\`);
    }

    // Use feature flag or percentage-based routing
    const useModern = this.shouldUseModern(endpoint, route.percentage);

    if (useModern) {
      try {
        const result = await route.modern(...args);
        // Log success for monitoring
        this.logMigrationSuccess(endpoint);
        return result;
      } catch (error) {
        // Fallback to legacy on error
        console.error('Modern implementation failed, falling back:', error);
        return route.legacy(...args);
      }
    }

    return route.legacy(...args);
  }

  shouldUseModern(endpoint, percentage) {
    // Check feature flags first
    if (process.env[\`MODERN_\${endpoint.toUpperCase()}\`] === 'true') {
      return true;
    }

    // Random percentage-based routing
    return Math.random() * 100 < percentage;
  }

  // Gradually increase modern usage
  async increaseMigration(endpoint, newPercentage) {
    const route = this.routes.get(endpoint);
    if (!route) return;

    route.percentage = Math.min(100, newPercentage);
    
    // Run comparison test
    await this.runComparisonTest(endpoint);
  }

  async runComparisonTest(endpoint) {
    const route = this.routes.get(endpoint);
    const testData = this.getTestData(endpoint);

    const [legacyResult, modernResult] = await Promise.all([
      route.legacy(...testData),
      route.modern(...testData)
    ]);

    // Compare results
    const isEqual = JSON.stringify(legacyResult) === JSON.stringify(modernResult);
    
    if (!isEqual) {
      console.warn(\`Discrepancy detected in \${endpoint}\`);
      // Log for investigation
    }
  }
}

// Usage
const router = new ModernizationRouter();

router.register('getCustomer', {
  legacy: async (id) => legacySystem.getCustomer(id),
  modern: async (id) => modernAPI.getCustomer(id),
  percentage: 25 // Start with 25% modern traffic
});

// Gradually increase modern usage
await router.increaseMigration('getCustomer', 50);
await router.increaseMigration('getCustomer', 75);
await router.increaseMigration('getCustomer', 100);
\`\`\`

## Monitoring en maintenance

Legacy integraties vereisen extra aandacht voor monitoring:

\`\`\`javascript
class LegacyIntegrationMonitor {
  constructor() {
    this.metrics = {
      soapCalls: new Map(),
      ftpTransfers: new Map(),
      dbQueries: new Map(),
      errors: []
    };
  }

  // Track SOAP performance
  trackSOAPCall(method, duration, success) {
    if (!this.metrics.soapCalls.has(method)) {
      this.metrics.soapCalls.set(method, {
        count: 0,
        totalDuration: 0,
        failures: 0
      });
    }

    const metric = this.metrics.soapCalls.get(method);
    metric.count++;
    metric.totalDuration += duration;
    if (!success) metric.failures++;
  }

  // Monitor file transfers
  trackFileTransfer(filename, size, duration, success) {
    const date = new Date().toISOString().split('T')[0];
    
    if (!this.metrics.ftpTransfers.has(date)) {
      this.metrics.ftpTransfers.set(date, {
        count: 0,
        totalSize: 0,
        totalDuration: 0,
        failures: []
      });
    }

    const metric = this.metrics.ftpTransfers.get(date);
    metric.count++;
    metric.totalSize += size;
    metric.totalDuration += duration;
    
    if (!success) {
      metric.failures.push({ filename, size, duration });
    }
  }

  // Generate health report
  generateHealthReport() {
    const report = {
      timestamp: new Date(),
      soap: this.getSOAPHealth(),
      ftp: this.getFTPHealth(),
      database: this.getDatabaseHealth(),
      recommendations: this.getRecommendations()
    };

    return report;
  }

  getSOAPHealth() {
    const health = { status: 'healthy', services: {} };
    
    for (const [method, metrics] of this.metrics.soapCalls) {
      const avgDuration = metrics.totalDuration / metrics.count;
      const errorRate = (metrics.failures / metrics.count) * 100;
      
      health.services[method] = {
        calls: metrics.count,
        avgResponseTime: avgDuration,
        errorRate: \`\${errorRate.toFixed(2)}%\`
      };

      if (errorRate > 5) health.status = 'degraded';
      if (errorRate > 10) health.status = 'unhealthy';
    }

    return health;
  }

  // Alert on issues
  checkAlerts() {
    const alerts = [];

    // Check SOAP error rates
    for (const [method, metrics] of this.metrics.soapCalls) {
      const errorRate = (metrics.failures / metrics.count) * 100;
      if (errorRate > 10) {
        alerts.push({
          severity: 'high',
          service: 'soap',
          message: \`High error rate for \${method}: \${errorRate.toFixed(2)}%\`
        });
      }
    }

    // Check file transfer delays
    const today = new Date().toISOString().split('T')[0];
    const ftpMetrics = this.metrics.ftpTransfers.get(today);
    
    if (ftpMetrics && ftpMetrics.failures.length > 5) {
      alerts.push({
        severity: 'medium',
        service: 'ftp',
        message: \`\${ftpMetrics.failures.length} file transfer failures today\`
      });
    }

    return alerts;
  }
}

// Integration with monitoring services
const monitor = new LegacyIntegrationMonitor();

// Wrap legacy calls with monitoring
async function monitoredSOAPCall(client, method, ...args) {
  const start = Date.now();
  let success = true;
  
  try {
    return await client[method](...args);
  } catch (error) {
    success = false;
    throw error;
  } finally {
    monitor.trackSOAPCall(method, Date.now() - start, success);
  }
}

// Schedule health checks
setInterval(() => {
  const report = monitor.generateHealthReport();
  const alerts = monitor.checkAlerts();
  
  if (alerts.length > 0) {
    // Send alerts to ops team
    sendAlerts(alerts);
  }
  
  // Log metrics
  console.log('Legacy System Health:', report);
}, 60000); // Every minute
\`\`\`

## Best practices checklist

□ Always use connection pooling
□ Implement retry logic with exponential backoff
□ Add circuit breakers voor failing services
□ Log all legacy interactions for debugging
□ Monitor performance metrics closely
□ Document all data transformations
□ Test edge cases thoroughly
□ Plan for legacy system downtime
□ Keep legacy credentials secure
□ Version your integration layer
□ Add feature flags for gradual rollout
□ Test in parallel with legacy system
□ Maintain backwards compatibility
□ Document migration progress
□ Plan rollback procedures`,
  codeExamples: [
    {
      id: 'legacy-integration-service',
      title: 'Complete Legacy Integration Service',
      language: 'javascript',
      code: `// Unified legacy integration service
const express = require('express');
const soap = require('soap');
const Client = require('ssh2-sftp-client');
const oracledb = require('oracledb');

class UnifiedLegacyService {
  constructor(config) {
    this.config = config;
    this.app = express();
    this.soapClient = null;
    this.sftpClient = new Client();
    this.dbPool = null;
    
    this.setupRoutes();
    this.initializeConnections();
  }

  async initializeConnections() {
    // Initialize all legacy connections
    await Promise.all([
      this.initSOAP(),
      this.initSFTP(),
      this.initDatabase()
    ]);
    
    console.log('All legacy connections established');
  }

  setupRoutes() {
    this.app.use(express.json());
    
    // Modern REST endpoints wrapping legacy functionality
    this.app.get('/api/customers/:id', this.getCustomer.bind(this));
    this.app.post('/api/orders', this.createOrder.bind(this));
    this.app.get('/api/inventory/:sku', this.checkInventory.bind(this));
    
    // Health check endpoint
    this.app.get('/health', this.healthCheck.bind(this));
  }

  async getCustomer(req, res) {
    try {
      const customerId = req.params.id;
      
      // Gather from multiple legacy sources
      const [soapData, dbData] = await Promise.all([
        this.fetchFromSOAP('GetCustomer', { id: customerId }),
        this.queryDatabase(
          'SELECT * FROM CUSTOMERS WHERE CUST_ID = :id',
          [customerId]
        )
      ]);

      // Transform and merge data
      const customer = this.transformCustomerData(soapData, dbData[0]);
      
      res.json(customer);
    } catch (error) {
      console.error('Customer fetch error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve customer',
        message: error.message 
      });
    }
  }

  transformCustomerData(soapData, dbData) {
    return {
      id: dbData.CUST_ID,
      name: soapData.CustomerName,
      email: dbData.EMAIL_ADDR,
      phone: soapData.ContactInfo?.Phone,
      address: {
        street: dbData.STREET,
        city: dbData.CITY,
        postalCode: dbData.POSTAL_CODE,
        country: soapData.Country
      },
      status: dbData.STATUS === 'A' ? 'active' : 'inactive',
      creditLimit: parseFloat(soapData.CreditLimit),
      lastUpdated: new Date(dbData.LAST_UPDATE)
    };
  }

  async createOrder(req, res) {
    const transaction = await this.beginTransaction();
    
    try {
      const orderData = req.body;
      
      // Validate against legacy business rules
      await this.validateOrder(orderData);
      
      // Create order in legacy system
      const orderId = await this.createLegacyOrder(orderData, transaction);
      
      // Generate order file for FTP
      await this.generateOrderFile(orderId, orderData);
      
      // Commit transaction
      await this.commitTransaction(transaction);
      
      res.status(201).json({
        orderId,
        status: 'created',
        message: 'Order successfully created in legacy system'
      });
    } catch (error) {
      await this.rollbackTransaction(transaction);
      
      res.status(400).json({
        error: 'Order creation failed',
        message: error.message
      });
    }
  }

  async checkInventory(req, res) {
    try {
      const sku = req.params.sku;
      
      // Check real-time inventory via SOAP
      const soapInventory = await this.fetchFromSOAP('GetInventory', { 
        SKU: sku 
      });
      
      // Check pending orders in database
      const pendingOrders = await this.queryDatabase(
        \`SELECT SUM(QUANTITY) as PENDING 
         FROM ORDER_ITEMS 
         WHERE SKU = :sku AND STATUS = 'PENDING'\`,
        [sku]
      );
      
      const available = soapInventory.Quantity - (pendingOrders[0]?.PENDING || 0);
      
      res.json({
        sku,
        totalQuantity: soapInventory.Quantity,
        pendingOrders: pendingOrders[0]?.PENDING || 0,
        availableQuantity: Math.max(0, available),
        warehouse: soapInventory.Warehouse,
        lastUpdated: new Date()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Inventory check failed',
        message: error.message
      });
    }
  }

  async healthCheck(req, res) {
    const health = {
      status: 'healthy',
      services: {},
      timestamp: new Date()
    };

    // Check SOAP service
    try {
      await this.fetchFromSOAP('Ping', {});
      health.services.soap = 'connected';
    } catch {
      health.services.soap = 'disconnected';
      health.status = 'degraded';
    }

    // Check database
    try {
      await this.queryDatabase('SELECT 1 FROM DUAL', []);
      health.services.database = 'connected';
    } catch {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }

    // Check SFTP
    try {
      await this.sftpClient.list('/');
      health.services.sftp = 'connected';
    } catch {
      health.services.sftp = 'disconnected';
      health.status = 'degraded';
    }

    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(\`Legacy integration service running on port \${port}\`);
    });
  }
}

// Start the service
const service = new UnifiedLegacyService({
  soap: {
    wsdl: process.env.LEGACY_WSDL_URL,
    auth: {
      username: process.env.SOAP_USER,
      password: process.env.SOAP_PASS
    }
  },
  sftp: {
    host: process.env.SFTP_HOST,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASS
  },
  database: {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    connectString: process.env.DB_CONNECT
  }
});

service.start();`
    }
  ],
  assignments: [
    {
      id: 'soap-to-rest',
      title: 'SOAP naar REST transformer',
      description: 'Bouw een service die een legacy SOAP API wrapt in een moderne REST interface met JSON responses, inclusief data transformatie en error mapping.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'file-processor',
      title: 'Multi-format file processor',
      description: 'Create een robuuste file processing pipeline die CSV, XML, en fixed-width files kan verwerken, met validation, error handling, en retry logic.',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'legacy-modernization',
      title: 'Legacy modernization strategy',
      description: 'Analyseer een bestaand legacy systeem en ontwerp een complete modernization strategy inclusief migration path, risk assessment, en implementation roadmap.',
      difficulty: 'hard',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'Enterprise Integration Patterns',
      url: 'https://www.enterpriseintegrationpatterns.com/',
      type: 'book'
    },
    {
      title: 'Working Effectively with Legacy Code',
      url: 'https://www.amazon.com/Working-Effectively-Legacy-Michael-Feathers/dp/0131177052',
      type: 'book'
    },
    {
      title: 'SOAP vs REST comparison',
      url: 'https://www.soapui.org/learn/api/soap-vs-rest-api/',
      type: 'article'
    },
    {
      title: 'Database Migration Best Practices',
      url: 'https://www.red-gate.com/simple-talk/databases/sql-server/database-administration-sql-server/database-migration-best-practices/',
      type: 'guide'
    },
    {
      title: 'Martin Fowler - Strangler Fig Application',
      url: 'https://martinfowler.com/bliki/StranglerFigApplication.html',
      type: 'article'
    }
  ]
};