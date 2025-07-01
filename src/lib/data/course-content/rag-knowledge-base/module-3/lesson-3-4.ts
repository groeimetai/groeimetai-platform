import { Lesson } from '@/lib/data/courses'

export const lesson3_4: Lesson = {
  id: 'lesson-3-4',
  title: 'Building a production-ready ingestion pipeline',
  duration: '50 min',
  content: `# Building a production-ready ingestion pipeline

A production-ready ingestion pipeline is the backbone of any RAG system at scale. It must handle high volumes, ensure data quality, and remain resilient to failures while being cost-effective.

## Production Pipeline Architecture

### Core Components

A robust ingestion pipeline consists of several key components:

1. **Ingestion Layer**: Entry point for all data sources
2. **Queue System**: Manages processing flow and backpressure
3. **Processing Workers**: Parallel document processors
4. **Storage Layer**: Manages raw and processed data
5. **Vector Database**: Stores embeddings and metadata
6. **Monitoring System**: Tracks pipeline health and performance

### Reference Architecture

\`\`\`
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Data Sources│────▶│ Message Queue│────▶│  Workers     │
└─────────────┘     └──────────────┘     └──────┬───────┘
                            │                     │
                    ┌───────▼───────┐    ┌───────▼───────┐
                    │  Monitoring   │    │ Vector Store  │
                    └───────────────┘    └───────────────┘
\`\`\`

## Scalability Considerations

### Queue-based Processing

Message queues enable horizontal scaling and fault tolerance:

\`\`\`python
from celery import Celery
from kombu import Queue
import redis

# Configure Celery with Redis
app = Celery('ingestion', broker='redis://localhost:6379')

# Define queues with priorities
app.conf.task_routes = {
    'ingest.process_document': {'queue': 'documents'},
    'ingest.generate_embeddings': {'queue': 'embeddings'},
    'ingest.update_index': {'queue': 'indexing'}
}

app.conf.task_queue_max_priority = 10
app.conf.task_default_priority = 5

@app.task(bind=True, max_retries=3)
def process_document(self, document_id: str, source: str):
    try:
        # Process document
        doc = fetch_document(document_id, source)
        chunks = chunk_document(doc)
        
        # Queue embedding generation
        for chunk in chunks:
            generate_embeddings.apply_async(
                args=[chunk.id],
                priority=doc.priority
            )
        
        return {"status": "success", "chunks": len(chunks)}
    
    except Exception as exc:
        # Exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
\`\`\`

### Parallel Processing

Implement parallel processing for maximum throughput:

\`\`\`python
import asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from typing import List, Dict, Any
import multiprocessing as mp

class ParallelProcessor:
    def __init__(self, max_workers: int = None):
        self.max_workers = max_workers or mp.cpu_count()
        self.thread_pool = ThreadPoolExecutor(max_workers=self.max_workers)
        self.process_pool = ProcessPoolExecutor(max_workers=self.max_workers)
    
    async def process_batch(self, documents: List[Dict[str, Any]]):
        """Process documents in parallel batches"""
        # Group by processing type
        text_docs = [d for d in documents if d['type'] == 'text']
        pdf_docs = [d for d in documents if d['type'] == 'pdf']
        
        # Process different types in parallel
        tasks = []
        
        if text_docs:
            tasks.append(self._process_text_batch(text_docs))
        
        if pdf_docs:
            tasks.append(self._process_pdf_batch(pdf_docs))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return self._merge_results(results)
    
    async def _process_text_batch(self, documents: List[Dict]):
        loop = asyncio.get_event_loop()
        
        # CPU-bound text processing in process pool
        futures = []
        for doc in documents:
            future = loop.run_in_executor(
                self.process_pool,
                process_text_document,
                doc
            )
            futures.append(future)
        
        return await asyncio.gather(*futures)
    
    async def _process_pdf_batch(self, documents: List[Dict]):
        loop = asyncio.get_event_loop()
        
        # I/O-bound PDF processing in thread pool
        futures = []
        for doc in documents:
            future = loop.run_in_executor(
                self.thread_pool,
                process_pdf_document,
                doc
            )
            futures.append(future)
        
        return await asyncio.gather(*futures)
\`\`\`

### Incremental Updates

Efficiently handle document updates:

\`\`\`python
from datetime import datetime
import hashlib
from typing import Optional

class IncrementalUpdater:
    def __init__(self, vector_store, metadata_store):
        self.vector_store = vector_store
        self.metadata_store = metadata_store
    
    def should_update(self, document: Dict) -> bool:
        """Check if document needs updating"""
        doc_hash = self._compute_hash(document['content'])
        
        # Check existing metadata
        existing = self.metadata_store.get(document['id'])
        
        if not existing:
            return True
        
        # Compare hashes and timestamps
        if existing['content_hash'] != doc_hash:
            return True
        
        if document.get('force_update', False):
            return True
        
        # Check if older than update threshold
        last_update = datetime.fromisoformat(existing['last_updated'])
        age = datetime.now() - last_update
        
        return age.days > 30  # Re-process monthly
    
    def update_document(self, document: Dict):
        """Perform incremental update"""
        if not self.should_update(document):
            return {"status": "skipped", "reason": "no_changes"}
        
        # Get existing chunks
        existing_chunks = self.vector_store.get_chunks(document['id'])
        
        # Process new content
        new_chunks = chunk_document(document)
        
        # Compute diff
        added, modified, deleted = self._compute_diff(
            existing_chunks, 
            new_chunks
        )
        
        # Apply changes
        if deleted:
            self.vector_store.delete_chunks(deleted)
        
        if added or modified:
            chunks_to_embed = added + modified
            embeddings = generate_embeddings(chunks_to_embed)
            self.vector_store.upsert_chunks(chunks_to_embed, embeddings)
        
        # Update metadata
        self.metadata_store.update(document['id'], {
            'content_hash': self._compute_hash(document['content']),
            'last_updated': datetime.now().isoformat(),
            'chunks_added': len(added),
            'chunks_modified': len(modified),
            'chunks_deleted': len(deleted)
        })
        
        return {
            "status": "updated",
            "changes": {
                "added": len(added),
                "modified": len(modified),
                "deleted": len(deleted)
            }
        }
\`\`\`

## Error Handling and Recovery

### Comprehensive Error Strategy

\`\`\`python
from enum import Enum
from typing import Callable
import logging
import traceback

class ErrorSeverity(Enum):
    RECOVERABLE = "recoverable"
    CRITICAL = "critical"
    TRANSIENT = "transient"

class ErrorHandler:
    def __init__(self, dead_letter_queue, alert_service):
        self.dead_letter_queue = dead_letter_queue
        self.alert_service = alert_service
        self.logger = logging.getLogger(__name__)
        
        # Error classification rules
        self.error_rules = {
            ConnectionError: ErrorSeverity.TRANSIENT,
            TimeoutError: ErrorSeverity.TRANSIENT,
            ValueError: ErrorSeverity.RECOVERABLE,
            PermissionError: ErrorSeverity.CRITICAL,
            OutOfMemoryError: ErrorSeverity.CRITICAL,
        }
    
    def handle_error(self, error: Exception, context: Dict):
        """Centralized error handling with recovery strategies"""
        severity = self._classify_error(error)
        
        # Log error with context
        self.logger.error(
            f"Pipeline error: {type(error).__name__}",
            extra={
                "error": str(error),
                "severity": severity.value,
                "context": context,
                "traceback": traceback.format_exc()
            }
        )
        
        # Apply recovery strategy
        if severity == ErrorSeverity.TRANSIENT:
            return self._handle_transient_error(error, context)
        elif severity == ErrorSeverity.RECOVERABLE:
            return self._handle_recoverable_error(error, context)
        else:
            return self._handle_critical_error(error, context)
    
    def _handle_transient_error(self, error: Exception, context: Dict):
        """Retry with exponential backoff"""
        retry_count = context.get('retry_count', 0)
        
        if retry_count < 5:
            delay = 2 ** retry_count
            return {
                "action": "retry",
                "delay": delay,
                "retry_count": retry_count + 1
            }
        else:
            # Max retries exceeded
            return self._handle_recoverable_error(error, context)
    
    def _handle_recoverable_error(self, error: Exception, context: Dict):
        """Send to dead letter queue for manual intervention"""
        self.dead_letter_queue.send({
            "error": str(error),
            "error_type": type(error).__name__,
            "context": context,
            "timestamp": datetime.now().isoformat()
        })
        
        return {"action": "quarantine", "reason": str(error)}
    
    def _handle_critical_error(self, error: Exception, context: Dict):
        """Alert and halt processing"""
        self.alert_service.send_critical_alert({
            "error": str(error),
            "pipeline": context.get('pipeline_id'),
            "impact": "Pipeline halted"
        })
        
        return {"action": "halt", "reason": "Critical error"}
\`\`\`

## Monitoring and Observability

### Comprehensive Monitoring System

\`\`\`python
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from opentelemetry import trace, metrics
from opentelemetry.exporter.otlp.proto.grpc import (
    trace_exporter, metrics_exporter
)
import time
from functools import wraps

# Metrics
documents_processed = Counter(
    'pipeline_documents_processed_total',
    'Total documents processed',
    ['status', 'source']
)

processing_time = Histogram(
    'pipeline_processing_duration_seconds',
    'Document processing time',
    ['stage', 'document_type']
)

queue_depth = Gauge(
    'pipeline_queue_depth',
    'Current queue depth',
    ['queue_name']
)

error_rate = Counter(
    'pipeline_errors_total',
    'Total pipeline errors',
    ['error_type', 'severity']
)

class PipelineMonitor:
    def __init__(self):
        self.tracer = trace.get_tracer(__name__)
        self.meter = metrics.get_meter(__name__)
        
        # Create metrics
        self.doc_counter = self.meter.create_counter(
            "documents_processed",
            description="Number of documents processed"
        )
        
        self.latency_histogram = self.meter.create_histogram(
            "processing_latency",
            description="Processing latency in milliseconds"
        )
    
    def track_processing(self, stage: str):
        """Decorator to track processing metrics"""
        def decorator(func: Callable):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Start span
                with self.tracer.start_as_current_span(f"process_{stage}") as span:
                    start_time = time.time()
                    
                    try:
                        # Add span attributes
                        span.set_attribute("stage", stage)
                        span.set_attribute("document_id", kwargs.get('document_id', 'unknown'))
                        
                        # Execute function
                        result = func(*args, **kwargs)
                        
                        # Record success metrics
                        duration = time.time() - start_time
                        processing_time.labels(
                            stage=stage,
                            document_type=kwargs.get('doc_type', 'unknown')
                        ).observe(duration)
                        
                        documents_processed.labels(
                            status='success',
                            source=kwargs.get('source', 'unknown')
                        ).inc()
                        
                        return result
                    
                    except Exception as e:
                        # Record error metrics
                        error_rate.labels(
                            error_type=type(e).__name__,
                            severity='high'
                        ).inc()
                        
                        span.record_exception(e)
                        span.set_status(trace.Status(trace.StatusCode.ERROR))
                        raise
            
            return wrapper
        return decorator
    
    def export_metrics(self):
        """Export Prometheus metrics"""
        return generate_latest()
\`\`\`

### Health Checks and Alerts

\`\`\`python
class PipelineHealthCheck:
    def __init__(self, components: Dict[str, Any]):
        self.components = components
        self.health_status = {}
    
    async def check_health(self) -> Dict[str, Any]:
        """Perform comprehensive health check"""
        checks = {
            'queue': self._check_queue_health(),
            'database': self._check_database_health(),
            'vector_store': self._check_vector_store_health(),
            'workers': self._check_worker_health(),
            'storage': self._check_storage_health()
        }
        
        results = await asyncio.gather(
            *checks.values(),
            return_exceptions=True
        )
        
        health_report = {}
        for component, result in zip(checks.keys(), results):
            if isinstance(result, Exception):
                health_report[component] = {
                    'status': 'unhealthy',
                    'error': str(result)
                }
            else:
                health_report[component] = result
        
        # Overall health
        all_healthy = all(
            r.get('status') == 'healthy' 
            for r in health_report.values()
        )
        
        return {
            'status': 'healthy' if all_healthy else 'degraded',
            'timestamp': datetime.now().isoformat(),
            'components': health_report
        }
    
    async def _check_queue_health(self):
        try:
            # Check queue connectivity and depth
            queue = self.components['queue']
            depth = await queue.get_depth()
            
            # Alert if queue is backing up
            if depth > 10000:
                return {
                    'status': 'warning',
                    'message': f'Queue depth high: {depth}',
                    'depth': depth
                }
            
            return {'status': 'healthy', 'depth': depth}
        
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}
\`\`\`

## Data Quality Checks

### Quality Validation Framework

\`\`\`python
from abc import ABC, abstractmethod
from typing import List, Tuple
import re

class QualityCheck(ABC):
    @abstractmethod
    def validate(self, document: Dict) -> Tuple[bool, Optional[str]]:
        pass

class ContentLengthCheck(QualityCheck):
    def __init__(self, min_length: int = 100, max_length: int = 1000000):
        self.min_length = min_length
        self.max_length = max_length
    
    def validate(self, document: Dict) -> Tuple[bool, Optional[str]]:
        content_length = len(document.get('content', ''))
        
        if content_length < self.min_length:
            return False, f"Content too short: {content_length} chars"
        
        if content_length > self.max_length:
            return False, f"Content too long: {content_length} chars"
        
        return True, None

class LanguageCheck(QualityCheck):
    def __init__(self, supported_languages: List[str]):
        self.supported_languages = supported_languages
    
    def validate(self, document: Dict) -> Tuple[bool, Optional[str]]:
        detected_lang = detect_language(document['content'])
        
        if detected_lang not in self.supported_languages:
            return False, f"Unsupported language: {detected_lang}"
        
        return True, None

class DataQualityValidator:
    def __init__(self):
        self.checks = [
            ContentLengthCheck(),
            LanguageCheck(['en', 'nl', 'de']),
            DuplicateContentCheck(),
            SchemaValidationCheck(),
            EncodingCheck()
        ]
        
        self.quality_metrics = Counter(
            'pipeline_quality_checks',
            'Data quality check results',
            ['check_name', 'result']
        )
    
    def validate_document(self, document: Dict) -> Dict[str, Any]:
        """Run all quality checks on document"""
        results = []
        passed_all = True
        
        for check in self.checks:
            check_name = check.__class__.__name__
            passed, message = check.validate(document)
            
            results.append({
                'check': check_name,
                'passed': passed,
                'message': message
            })
            
            # Record metrics
            self.quality_metrics.labels(
                check_name=check_name,
                result='pass' if passed else 'fail'
            ).inc()
            
            if not passed:
                passed_all = False
        
        return {
            'valid': passed_all,
            'checks': results,
            'timestamp': datetime.now().isoformat()
        }
\`\`\`

## Deduplication Strategies

### Advanced Deduplication System

\`\`\`python
import simhash
from datasketch import MinHash, MinHashLSH
import mmh3

class DeduplicationEngine:
    def __init__(self, similarity_threshold: float = 0.9):
        self.similarity_threshold = similarity_threshold
        
        # MinHash LSH for near-duplicate detection
        self.lsh = MinHashLSH(
            threshold=similarity_threshold,
            num_perm=128
        )
        
        # Exact duplicate detection
        self.content_hashes = {}
        
        # Simhash for similar content
        self.simhash_index = {}
    
    def is_duplicate(self, document: Dict) -> Tuple[bool, Optional[str]]:
        """Check if document is duplicate"""
        # 1. Check exact duplicate
        content_hash = self._hash_content(document['content'])
        
        if content_hash in self.content_hashes:
            return True, self.content_hashes[content_hash]
        
        # 2. Check near-duplicate with MinHash
        minhash = self._compute_minhash(document['content'])
        similar_docs = self.lsh.query(minhash)
        
        if similar_docs:
            # Verify similarity
            for doc_id in similar_docs:
                similarity = self._compute_similarity(
                    document['content'],
                    self._get_document_content(doc_id)
                )
                
                if similarity > self.similarity_threshold:
                    return True, doc_id
        
        # 3. Check with Simhash (for structural similarity)
        simhash_value = simhash.Simhash(document['content'])
        
        for doc_id, stored_simhash in self.simhash_index.items():
            distance = simhash_value.distance(stored_simhash)
            
            if distance < 5:  # Hamming distance threshold
                return True, doc_id
        
        # Not a duplicate - add to indices
        self._index_document(document, content_hash, minhash, simhash_value)
        
        return False, None
    
    def _compute_minhash(self, content: str) -> MinHash:
        """Compute MinHash signature"""
        minhash = MinHash(num_perm=128)
        
        # Shingle the content
        shingles = self._create_shingles(content, k=5)
        
        for shingle in shingles:
            minhash.update(shingle.encode('utf-8'))
        
        return minhash
    
    def _create_shingles(self, text: str, k: int) -> List[str]:
        """Create k-shingles from text"""
        words = text.lower().split()
        return [' '.join(words[i:i+k]) for i in range(len(words) - k + 1)]
    
    def _index_document(self, document: Dict, content_hash: str, 
                       minhash: MinHash, simhash_value: simhash.Simhash):
        """Add document to deduplication indices"""
        doc_id = document['id']
        
        # Add to exact duplicate index
        self.content_hashes[content_hash] = doc_id
        
        # Add to LSH index
        self.lsh.insert(doc_id, minhash)
        
        # Add to Simhash index
        self.simhash_index[doc_id] = simhash_value
\`\`\`

## Version Control for Documents

### Document Versioning System

\`\`\`python
from typing import List, Optional
import json
import difflib

class DocumentVersionControl:
    def __init__(self, storage_backend):
        self.storage = storage_backend
        self.version_metadata = {}
    
    def save_version(self, document: Dict) -> str:
        """Save new document version"""
        doc_id = document['id']
        
        # Get current version
        current_version = self._get_latest_version(doc_id)
        
        # Compute new version number
        if current_version:
            new_version = current_version['version'] + 1
            
            # Compute and store diff
            diff = self._compute_diff(
                current_version['content'],
                document['content']
            )
            
            # Store diff instead of full content for efficiency
            if len(diff) < len(document['content']) * 0.7:
                version_data = {
                    'version': new_version,
                    'timestamp': datetime.now().isoformat(),
                    'diff': diff,
                    'base_version': current_version['version'],
                    'metadata': document.get('metadata', {})
                }
            else:
                # Store full content if diff is too large
                version_data = {
                    'version': new_version,
                    'timestamp': datetime.now().isoformat(),
                    'content': document['content'],
                    'metadata': document.get('metadata', {})
                }
        else:
            # First version
            version_data = {
                'version': 1,
                'timestamp': datetime.now().isoformat(),
                'content': document['content'],
                'metadata': document.get('metadata', {})
            }
        
        # Store version
        version_key = f"{doc_id}:v{version_data['version']}"
        self.storage.put(version_key, version_data)
        
        # Update metadata
        self.version_metadata[doc_id] = {
            'latest_version': version_data['version'],
            'total_versions': version_data['version'],
            'last_updated': version_data['timestamp']
        }
        
        return version_key
    
    def get_version(self, doc_id: str, version: Optional[int] = None) -> Dict:
        """Retrieve specific document version"""
        if version is None:
            version = self.version_metadata[doc_id]['latest_version']
        
        version_key = f"{doc_id}:v{version}"
        version_data = self.storage.get(version_key)
        
        # Reconstruct content if stored as diff
        if 'diff' in version_data:
            base_version = self.get_version(doc_id, version_data['base_version'])
            version_data['content'] = self._apply_diff(
                base_version['content'],
                version_data['diff']
            )
        
        return version_data
    
    def compare_versions(self, doc_id: str, version1: int, version2: int) -> Dict:
        """Compare two versions of a document"""
        v1 = self.get_version(doc_id, version1)
        v2 = self.get_version(doc_id, version2)
        
        diff = list(difflib.unified_diff(
            v1['content'].splitlines(),
            v2['content'].splitlines(),
            fromfile=f"version_{version1}",
            tofile=f"version_{version2}",
            lineterm=''
        ))
        
        return {
            'version1': version1,
            'version2': version2,
            'diff': '\\n'.join(diff),
            'summary': {
                'lines_added': sum(1 for line in diff if line.startswith('+')),
                'lines_removed': sum(1 for line in diff if line.startswith('-'))
            }
        }
\`\`\`

## Update Detection and Deltas

### Change Detection System

\`\`\`python
import hashlib
from typing import Set, Tuple

class ChangeDetector:
    def __init__(self, metadata_store):
        self.metadata_store = metadata_store
        self.watchers = {}
    
    def register_source(self, source_id: str, config: Dict):
        """Register a data source for monitoring"""
        self.watchers[source_id] = SourceWatcher(
            source_id=source_id,
            check_interval=config.get('check_interval', 3600),
            change_detection_method=config.get('method', 'checksum')
        )
    
    async def check_for_updates(self) -> List[Dict]:
        """Check all registered sources for updates"""
        updates = []
        
        for source_id, watcher in self.watchers.items():
            try:
                changes = await watcher.detect_changes()
                
                if changes:
                    updates.append({
                        'source_id': source_id,
                        'changes': changes,
                        'timestamp': datetime.now().isoformat()
                    })
            
            except Exception as e:
                logging.error(f"Error checking source {source_id}: {e}")
        
        return updates
    
    def compute_document_delta(self, old_doc: Dict, new_doc: Dict) -> Dict:
        """Compute delta between document versions"""
        delta = {
            'document_id': old_doc['id'],
            'changes': []
        }
        
        # Content changes
        if old_doc['content'] != new_doc['content']:
            old_chunks = set(chunk_text(old_doc['content']))
            new_chunks = set(chunk_text(new_doc['content']))
            
            added_chunks = new_chunks - old_chunks
            removed_chunks = old_chunks - new_chunks
            
            # Find modified chunks (similar but not identical)
            modified_chunks = []
            for old_chunk in removed_chunks:
                for new_chunk in added_chunks:
                    similarity = compute_similarity(old_chunk, new_chunk)
                    
                    if similarity > 0.8:  # High similarity threshold
                        modified_chunks.append({
                            'old': old_chunk,
                            'new': new_chunk,
                            'similarity': similarity
                        })
            
            delta['changes'].append({
                'type': 'content',
                'added_chunks': list(added_chunks),
                'removed_chunks': list(removed_chunks),
                'modified_chunks': modified_chunks
            })
        
        # Metadata changes
        old_meta = old_doc.get('metadata', {})
        new_meta = new_doc.get('metadata', {})
        
        if old_meta != new_meta:
            meta_changes = {
                'added': {k: v for k, v in new_meta.items() if k not in old_meta},
                'removed': {k: v for k, v in old_meta.items() if k not in new_meta},
                'modified': {
                    k: {'old': old_meta[k], 'new': new_meta[k]}
                    for k in old_meta if k in new_meta and old_meta[k] != new_meta[k]
                }
            }
            
            delta['changes'].append({
                'type': 'metadata',
                'changes': meta_changes
            })
        
        return delta

class SourceWatcher:
    def __init__(self, source_id: str, check_interval: int, 
                 change_detection_method: str):
        self.source_id = source_id
        self.check_interval = check_interval
        self.method = change_detection_method
        self.last_check = None
        self.checksums = {}
    
    async def detect_changes(self) -> List[Dict]:
        """Detect changes in source"""
        if self.method == 'checksum':
            return await self._checksum_based_detection()
        elif self.method == 'timestamp':
            return await self._timestamp_based_detection()
        elif self.method == 'webhook':
            return await self._webhook_based_detection()
        else:
            raise ValueError(f"Unknown detection method: {self.method}")
\`\`\`

## Pipeline Orchestration

### Apache Airflow Integration

\`\`\`python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.sensors import S3KeySensor
from airflow.providers.celery.operators.celery import CeleryOperator
from datetime import datetime, timedelta

# Define DAG
default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

ingestion_dag = DAG(
    'document_ingestion_pipeline',
    default_args=default_args,
    description='Production document ingestion pipeline',
    schedule_interval='@hourly',
    catchup=False,
    max_active_runs=1
)

# Task definitions
def check_for_new_documents(**context):
    """Check for new documents to process"""
    source_monitor = SourceMonitor()
    new_docs = source_monitor.get_new_documents(
        since=context['data_interval_start']
    )
    
    # Push document list to XCom
    context['task_instance'].xcom_push(
        key='new_documents',
        value=new_docs
    )
    
    return len(new_docs)

def validate_documents(**context):
    """Validate document quality"""
    documents = context['task_instance'].xcom_pull(
        key='new_documents',
        task_ids='check_documents'
    )
    
    validator = DataQualityValidator()
    valid_docs = []
    invalid_docs = []
    
    for doc in documents:
        result = validator.validate_document(doc)
        
        if result['valid']:
            valid_docs.append(doc)
        else:
            invalid_docs.append({
                'document': doc,
                'validation_result': result
            })
    
    # Store results
    context['task_instance'].xcom_push(
        key='valid_documents',
        value=valid_docs
    )
    
    context['task_instance'].xcom_push(
        key='invalid_documents',
        value=invalid_docs
    )
    
    return {
        'valid': len(valid_docs),
        'invalid': len(invalid_docs)
    }

# Define tasks
check_docs_task = PythonOperator(
    task_id='check_documents',
    python_callable=check_for_new_documents,
    dag=ingestion_dag
)

validate_task = PythonOperator(
    task_id='validate_documents',
    python_callable=validate_documents,
    dag=ingestion_dag
)

process_task = CeleryOperator(
    task_id='process_documents',
    queue='document_processing',
    task_name='process_document_batch',
    dag=ingestion_dag
)

embed_task = CeleryOperator(
    task_id='generate_embeddings',
    queue='embedding_generation',
    task_name='generate_embeddings_batch',
    dag=ingestion_dag
)

index_task = CeleryOperator(
    task_id='update_index',
    queue='index_updates',
    task_name='update_vector_index',
    dag=ingestion_dag
)

# Set task dependencies
check_docs_task >> validate_task >> process_task >> embed_task >> index_task
\`\`\`

### Prefect Alternative

\`\`\`python
from prefect import flow, task, get_run_logger
from prefect.task_runners import ConcurrentTaskRunner
from prefect.deployments import Deployment
from prefect.server.schemas.schedules import IntervalSchedule

@task(retries=3, retry_delay_seconds=60)
def extract_documents(source: str) -> List[Dict]:
    """Extract documents from source"""
    logger = get_run_logger()
    logger.info(f"Extracting documents from {source}")
    
    extractor = DocumentExtractor(source)
    documents = extractor.extract()
    
    logger.info(f"Extracted {len(documents)} documents")
    return documents

@task
def deduplicate_documents(documents: List[Dict]) -> List[Dict]:
    """Remove duplicate documents"""
    dedup_engine = DeduplicationEngine()
    unique_docs = []
    
    for doc in documents:
        is_dup, dup_id = dedup_engine.is_duplicate(doc)
        
        if not is_dup:
            unique_docs.append(doc)
    
    return unique_docs

@task(tags=["ml", "cpu-intensive"])
def generate_embeddings(documents: List[Dict]) -> List[Dict]:
    """Generate embeddings for documents"""
    embedder = DocumentEmbedder()
    
    for doc in documents:
        doc['embeddings'] = embedder.embed(doc['content'])
    
    return documents

@flow(
    name="document-ingestion",
    description="Production document ingestion pipeline",
    task_runner=ConcurrentTaskRunner(max_workers=10)
)
def ingestion_pipeline(sources: List[str]):
    """Main ingestion pipeline flow"""
    logger = get_run_logger()
    logger.info(f"Starting ingestion for {len(sources)} sources")
    
    # Extract documents from all sources
    all_documents = []
    for source in sources:
        docs = extract_documents(source)
        all_documents.extend(docs)
    
    # Deduplicate
    unique_docs = deduplicate_documents(all_documents)
    logger.info(f"Found {len(unique_docs)} unique documents")
    
    # Process in batches
    batch_size = 100
    batches = [
        unique_docs[i:i + batch_size] 
        for i in range(0, len(unique_docs), batch_size)
    ]
    
    # Generate embeddings in parallel
    embedded_batches = []
    for batch in batches:
        embedded = generate_embeddings(batch)
        embedded_batches.append(embedded)
    
    # Flatten results
    all_embedded = [doc for batch in embedded_batches for doc in batch]
    
    logger.info(f"Pipeline completed: {len(all_embedded)} documents processed")
    return all_embedded

# Create deployment
deployment = Deployment.build_from_flow(
    flow=ingestion_pipeline,
    name="production-ingestion",
    parameters={
        "sources": ["s3://documents", "gs://content", "azure://data"]
    },
    schedule=IntervalSchedule(interval=timedelta(hours=1)),
    work_queue_name="production"
)

deployment.apply()
\`\`\`

## Cost Optimization

### Resource-Aware Processing

\`\`\`python
import psutil
from typing import Dict, List
import numpy as np

class CostOptimizer:
    def __init__(self, cost_config: Dict):
        self.cost_config = cost_config
        self.resource_monitor = ResourceMonitor()
    
    def optimize_batch_size(self, documents: List[Dict]) -> int:
        """Dynamically determine optimal batch size"""
        # Get current resource usage
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_percent = psutil.virtual_memory().percent
        
        # Document characteristics
        avg_doc_size = np.mean([len(d['content']) for d in documents[:10]])
        
        # Base batch size
        base_batch = 100
        
        # Adjust based on resources
        if cpu_percent > 80:
            base_batch = int(base_batch * 0.5)
        elif cpu_percent < 30:
            base_batch = int(base_batch * 1.5)
        
        if memory_percent > 80:
            base_batch = int(base_batch * 0.7)
        
        # Adjust based on document size
        if avg_doc_size > 50000:  # Large documents
            base_batch = max(10, int(base_batch * 0.3))
        
        return max(1, min(base_batch, 1000))
    
    def select_processing_tier(self, document: Dict) -> str:
        """Select appropriate processing tier based on document"""
        doc_size = len(document['content'])
        priority = document.get('priority', 'normal')
        
        # High priority always gets premium tier
        if priority == 'high':
            return 'premium'
        
        # Large documents need more resources
        if doc_size > 100000:
            return 'standard'
        
        # Small, low-priority documents can use spot instances
        if doc_size < 5000 and priority == 'low':
            return 'spot'
        
        return 'standard'
    
    def estimate_processing_cost(self, documents: List[Dict]) -> Dict:
        """Estimate processing cost for document batch"""
        total_cost = 0
        cost_breakdown = {
            'compute': 0,
            'storage': 0,
            'embeddings': 0,
            'network': 0
        }
        
        for doc in documents:
            # Compute cost
            processing_time = self._estimate_processing_time(doc)
            tier = self.select_processing_tier(doc)
            compute_cost = (
                processing_time * 
                self.cost_config['compute_per_hour'][tier] / 3600
            )
            cost_breakdown['compute'] += compute_cost
            
            # Embedding cost
            num_tokens = len(doc['content'].split()) * 1.3  # Rough estimate
            embedding_cost = (
                num_tokens * 
                self.cost_config['embedding_per_1k_tokens'] / 1000
            )
            cost_breakdown['embeddings'] += embedding_cost
            
            # Storage cost
            doc_size_gb = len(doc['content']) / (1024 ** 3)
            storage_cost = doc_size_gb * self.cost_config['storage_per_gb_month']
            cost_breakdown['storage'] += storage_cost
        
        total_cost = sum(cost_breakdown.values())
        
        return {
            'total_cost': total_cost,
            'breakdown': cost_breakdown,
            'cost_per_document': total_cost / len(documents) if documents else 0
        }
\`\`\`

## Security Considerations

### Security Framework

\`\`\`python
import jwt
import hashlib
from cryptography.fernet import Fernet
from typing import Optional

class SecurityManager:
    def __init__(self, config: Dict):
        self.encryption_key = config['encryption_key']
        self.fernet = Fernet(self.encryption_key)
        self.jwt_secret = config['jwt_secret']
        self.allowed_sources = set(config['allowed_sources'])
    
    def validate_source(self, source: str, credentials: Dict) -> bool:
        """Validate document source"""
        if source not in self.allowed_sources:
            return False
        
        # Verify API key or OAuth token
        if 'api_key' in credentials:
            return self._validate_api_key(source, credentials['api_key'])
        elif 'oauth_token' in credentials:
            return self._validate_oauth_token(source, credentials['oauth_token'])
        
        return False
    
    def encrypt_sensitive_content(self, document: Dict) -> Dict:
        """Encrypt sensitive fields in document"""
        encrypted_doc = document.copy()
        
        # Identify and encrypt sensitive fields
        sensitive_fields = self._identify_sensitive_fields(document)
        
        for field_path in sensitive_fields:
            value = self._get_nested_field(document, field_path)
            
            if value:
                encrypted_value = self.fernet.encrypt(
                    value.encode('utf-8')
                ).decode('utf-8')
                
                self._set_nested_field(
                    encrypted_doc, 
                    field_path, 
                    encrypted_value
                )
                
                # Mark as encrypted
                self._set_nested_field(
                    encrypted_doc,
                    f"{field_path}_encrypted",
                    True
                )
        
        return encrypted_doc
    
    def sanitize_content(self, content: str) -> str:
        """Remove potentially harmful content"""
        # Remove script tags
        content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL)
        
        # Remove potential SQL injection attempts
        sql_patterns = [
            r'\\b(union|select|insert|update|delete|drop)\\b.*\\b(from|where)\\b',
            r'--.*$',
            r'/\\*.*?\\*/'
        ]
        
        for pattern in sql_patterns:
            content = re.sub(pattern, '', content, flags=re.IGNORECASE)
        
        # Remove potential path traversal
        content = re.sub(r'\\.\\./|\\.\\\\', '', content)
        
        return content
    
    def generate_access_token(self, user_id: str, permissions: List[str]) -> str:
        """Generate JWT access token for pipeline access"""
        payload = {
            'user_id': user_id,
            'permissions': permissions,
            'exp': datetime.utcnow() + timedelta(hours=1),
            'iat': datetime.utcnow()
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm='HS256')
    
    def audit_log(self, action: str, details: Dict):
        """Log security-relevant actions"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'action': action,
            'details': details,
            'hash': self._compute_log_hash(action, details)
        }
        
        # Write to immutable audit log
        self._write_audit_log(log_entry)
\`\`\`

## Complete Production Pipeline Example

\`\`\`python
# main_pipeline.py
import asyncio
from typing import List, Dict
import logging
from dataclasses import dataclass

@dataclass
class PipelineConfig:
    queue_url: str
    vector_store_url: str
    max_workers: int = 10
    batch_size: int = 100
    monitoring_enabled: bool = True
    security_enabled: bool = True

class ProductionIngestionPipeline:
    def __init__(self, config: PipelineConfig):
        self.config = config
        
        # Initialize components
        self.queue = MessageQueue(config.queue_url)
        self.vector_store = VectorStore(config.vector_store_url)
        self.processor = ParallelProcessor(max_workers=config.max_workers)
        self.monitor = PipelineMonitor()
        self.security = SecurityManager(load_security_config())
        self.dedup = DeduplicationEngine()
        self.quality = DataQualityValidator()
        self.error_handler = ErrorHandler(
            dead_letter_queue=self.queue.dead_letter,
            alert_service=AlertService()
        )
        
        self.logger = logging.getLogger(__name__)
    
    async def run(self):
        """Main pipeline execution loop"""
        self.logger.info("Starting production ingestion pipeline")
        
        while True:
            try:
                # Get batch of documents
                documents = await self.queue.get_batch(self.config.batch_size)
                
                if not documents:
                    await asyncio.sleep(5)
                    continue
                
                # Process batch
                results = await self.process_batch(documents)
                
                # Update metrics
                self.monitor.record_batch_processed(
                    batch_size=len(documents),
                    success_count=results['success'],
                    error_count=results['errors']
                )
                
            except Exception as e:
                self.logger.error(f"Pipeline error: {e}")
                self.error_handler.handle_error(e, {'stage': 'main_loop'})
    
    @monitor.track_processing("batch")
    async def process_batch(self, documents: List[Dict]) -> Dict:
        """Process a batch of documents"""
        results = {
            'success': 0,
            'errors': 0,
            'skipped': 0
        }
        
        # Stage 1: Security validation
        if self.config.security_enabled:
            documents = await self.security_stage(documents)
        
        # Stage 2: Quality validation
        valid_docs = []
        for doc in documents:
            validation_result = self.quality.validate_document(doc)
            
            if validation_result['valid']:
                valid_docs.append(doc)
            else:
                await self.queue.dead_letter.put({
                    'document': doc,
                    'reason': 'quality_validation_failed',
                    'details': validation_result
                })
                results['errors'] += 1
        
        # Stage 3: Deduplication
        unique_docs = []
        for doc in valid_docs:
            is_dup, dup_id = self.dedup.is_duplicate(doc)
            
            if not is_dup:
                unique_docs.append(doc)
            else:
                results['skipped'] += 1
        
        # Stage 4: Parallel processing
        if unique_docs:
            processed_docs = await self.processor.process_batch(unique_docs)
            
            # Stage 5: Generate embeddings
            embedded_docs = await self.generate_embeddings_batch(processed_docs)
            
            # Stage 6: Store in vector database
            await self.vector_store.upsert_batch(embedded_docs)
            
            results['success'] = len(embedded_docs)
        
        return results
    
    async def generate_embeddings_batch(self, documents: List[Dict]) -> List[Dict]:
        """Generate embeddings with optimal batching"""
        embedder = EmbeddingGenerator()
        
        # Group by size for optimal batching
        size_groups = {}
        for doc in documents:
            size_category = self._categorize_by_size(doc)
            
            if size_category not in size_groups:
                size_groups[size_category] = []
            
            size_groups[size_category].append(doc)
        
        # Process each group with appropriate batch size
        all_embedded = []
        for category, group_docs in size_groups.items():
            batch_size = self._get_optimal_batch_size(category)
            
            for i in range(0, len(group_docs), batch_size):
                batch = group_docs[i:i + batch_size]
                embedded = await embedder.embed_batch(batch)
                all_embedded.extend(embedded)
        
        return all_embedded
    
    def _categorize_by_size(self, document: Dict) -> str:
        """Categorize document by size"""
        size = len(document['content'])
        
        if size < 1000:
            return 'small'
        elif size < 10000:
            return 'medium'
        else:
            return 'large'
    
    def _get_optimal_batch_size(self, category: str) -> int:
        """Get optimal batch size for category"""
        batch_sizes = {
            'small': 200,
            'medium': 50,
            'large': 10
        }
        
        return batch_sizes.get(category, 50)

# Entry point
if __name__ == "__main__":
    config = PipelineConfig(
        queue_url="redis://localhost:6379",
        vector_store_url="http://localhost:8000",
        max_workers=20,
        batch_size=100,
        monitoring_enabled=True,
        security_enabled=True
    )
    
    pipeline = ProductionIngestionPipeline(config)
    
    # Run with monitoring
    asyncio.run(pipeline.run())
\`\`\`

This production-ready pipeline includes all necessary components for handling documents at scale with proper error handling, monitoring, and security measures.`,
  codeExamples: [
    {
      id: 'queue-based-processing',
      title: 'Queue-based Processing with Celery',
      language: 'python',
      code: `from celery import Celery
from kombu import Queue
import redis

# Configure Celery with Redis
app = Celery('ingestion', broker='redis://localhost:6379')

# Define queues with priorities
app.conf.task_routes = {
    'ingest.process_document': {'queue': 'documents'},
    'ingest.generate_embeddings': {'queue': 'embeddings'},
    'ingest.update_index': {'queue': 'indexing'}
}

app.conf.task_queue_max_priority = 10
app.conf.task_default_priority = 5

@app.task(bind=True, max_retries=3)
def process_document(self, document_id: str, source: str):
    try:
        # Process document
        doc = fetch_document(document_id, source)
        chunks = chunk_document(doc)
        
        # Queue embedding generation
        for chunk in chunks:
            generate_embeddings.apply_async(
                args=[chunk.id],
                priority=doc.priority
            )
        
        return {"status": "success", "chunks": len(chunks)}
    
    except Exception as exc:
        # Exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)`
    },
    {
      id: 'parallel-processor',
      title: 'Parallel Document Processor',
      language: 'python',
      code: `import asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from typing import List, Dict, Any
import multiprocessing as mp

class ParallelProcessor:
    def __init__(self, max_workers: int = None):
        self.max_workers = max_workers or mp.cpu_count()
        self.thread_pool = ThreadPoolExecutor(max_workers=self.max_workers)
        self.process_pool = ProcessPoolExecutor(max_workers=self.max_workers)
    
    async def process_batch(self, documents: List[Dict[str, Any]]):
        """Process documents in parallel batches"""
        # Group by processing type
        text_docs = [d for d in documents if d['type'] == 'text']
        pdf_docs = [d for d in documents if d['type'] == 'pdf']
        
        # Process different types in parallel
        tasks = []
        
        if text_docs:
            tasks.append(self._process_text_batch(text_docs))
        
        if pdf_docs:
            tasks.append(self._process_pdf_batch(pdf_docs))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return self._merge_results(results)
    
    async def _process_text_batch(self, documents: List[Dict]):
        loop = asyncio.get_event_loop()
        
        # CPU-bound text processing in process pool
        futures = []
        for doc in documents:
            future = loop.run_in_executor(
                self.process_pool,
                process_text_document,
                doc
            )
            futures.append(future)
        
        return await asyncio.gather(*futures)`
    },
    {
      id: 'deduplication-engine',
      title: 'Advanced Deduplication System',
      language: 'python',
      code: `import simhash
from datasketch import MinHash, MinHashLSH
import mmh3

class DeduplicationEngine:
    def __init__(self, similarity_threshold: float = 0.9):
        self.similarity_threshold = similarity_threshold
        
        # MinHash LSH for near-duplicate detection
        self.lsh = MinHashLSH(
            threshold=similarity_threshold,
            num_perm=128
        )
        
        # Exact duplicate detection
        self.content_hashes = {}
        
        # Simhash for similar content
        self.simhash_index = {}
    
    def is_duplicate(self, document: Dict) -> Tuple[bool, Optional[str]]:
        """Check if document is duplicate"""
        # 1. Check exact duplicate
        content_hash = self._hash_content(document['content'])
        
        if content_hash in self.content_hashes:
            return True, self.content_hashes[content_hash]
        
        # 2. Check near-duplicate with MinHash
        minhash = self._compute_minhash(document['content'])
        similar_docs = self.lsh.query(minhash)
        
        if similar_docs:
            # Verify similarity
            for doc_id in similar_docs:
                similarity = self._compute_similarity(
                    document['content'],
                    self._get_document_content(doc_id)
                )
                
                if similarity > self.similarity_threshold:
                    return True, doc_id
        
        # 3. Check with Simhash (for structural similarity)
        simhash_value = simhash.Simhash(document['content'])
        
        for doc_id, stored_simhash in self.simhash_index.items():
            distance = simhash_value.distance(stored_simhash)
            
            if distance < 5:  # Hamming distance threshold
                return True, doc_id
        
        # Not a duplicate - add to indices
        self._index_document(document, content_hash, minhash, simhash_value)
        
        return False, None`
    },
    {
      id: 'airflow-dag',
      title: 'Airflow Pipeline DAG',
      language: 'python',
      code: `from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.celery.operators.celery import CeleryOperator
from datetime import datetime, timedelta

# Define DAG
default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

ingestion_dag = DAG(
    'document_ingestion_pipeline',
    default_args=default_args,
    description='Production document ingestion pipeline',
    schedule_interval='@hourly',
    catchup=False,
    max_active_runs=1
)

# Task definitions
def check_for_new_documents(**context):
    """Check for new documents to process"""
    source_monitor = SourceMonitor()
    new_docs = source_monitor.get_new_documents(
        since=context['data_interval_start']
    )
    
    context['task_instance'].xcom_push(
        key='new_documents',
        value=new_docs
    )
    
    return len(new_docs)

# Define tasks
check_docs_task = PythonOperator(
    task_id='check_documents',
    python_callable=check_for_new_documents,
    dag=ingestion_dag
)

process_task = CeleryOperator(
    task_id='process_documents',
    queue='document_processing',
    task_name='process_document_batch',
    dag=ingestion_dag
)

embed_task = CeleryOperator(
    task_id='generate_embeddings',
    queue='embedding_generation',
    task_name='generate_embeddings_batch',
    dag=ingestion_dag
)

# Set task dependencies
check_docs_task >> process_task >> embed_task`
    },
    {
      id: 'monitoring-system',
      title: 'Pipeline Monitoring with Prometheus',
      language: 'python',
      code: `from prometheus_client import Counter, Histogram, Gauge, generate_latest
from opentelemetry import trace, metrics
import time
from functools import wraps

# Metrics
documents_processed = Counter(
    'pipeline_documents_processed_total',
    'Total documents processed',
    ['status', 'source']
)

processing_time = Histogram(
    'pipeline_processing_duration_seconds',
    'Document processing time',
    ['stage', 'document_type']
)

queue_depth = Gauge(
    'pipeline_queue_depth',
    'Current queue depth',
    ['queue_name']
)

class PipelineMonitor:
    def __init__(self):
        self.tracer = trace.get_tracer(__name__)
        self.meter = metrics.get_meter(__name__)
    
    def track_processing(self, stage: str):
        """Decorator to track processing metrics"""
        def decorator(func: Callable):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Start span
                with self.tracer.start_as_current_span(f"process_{stage}") as span:
                    start_time = time.time()
                    
                    try:
                        # Add span attributes
                        span.set_attribute("stage", stage)
                        span.set_attribute("document_id", kwargs.get('document_id', 'unknown'))
                        
                        # Execute function
                        result = func(*args, **kwargs)
                        
                        # Record success metrics
                        duration = time.time() - start_time
                        processing_time.labels(
                            stage=stage,
                            document_type=kwargs.get('doc_type', 'unknown')
                        ).observe(duration)
                        
                        documents_processed.labels(
                            status='success',
                            source=kwargs.get('source', 'unknown')
                        ).inc()
                        
                        return result
                    
                    except Exception as e:
                        # Record error metrics
                        span.record_exception(e)
                        span.set_status(trace.Status(trace.StatusCode.ERROR))
                        raise
            
            return wrapper
        return decorator`
    },
    {
      id: 'complete-pipeline',
      title: 'Complete Production Pipeline',
      language: 'python',
      code: `class ProductionIngestionPipeline:
    def __init__(self, config: PipelineConfig):
        self.config = config
        
        # Initialize components
        self.queue = MessageQueue(config.queue_url)
        self.vector_store = VectorStore(config.vector_store_url)
        self.processor = ParallelProcessor(max_workers=config.max_workers)
        self.monitor = PipelineMonitor()
        self.security = SecurityManager(load_security_config())
        self.dedup = DeduplicationEngine()
        self.quality = DataQualityValidator()
        self.error_handler = ErrorHandler(
            dead_letter_queue=self.queue.dead_letter,
            alert_service=AlertService()
        )
    
    async def run(self):
        """Main pipeline execution loop"""
        while True:
            try:
                # Get batch of documents
                documents = await self.queue.get_batch(self.config.batch_size)
                
                if not documents:
                    await asyncio.sleep(5)
                    continue
                
                # Process batch
                results = await self.process_batch(documents)
                
                # Update metrics
                self.monitor.record_batch_processed(
                    batch_size=len(documents),
                    success_count=results['success'],
                    error_count=results['errors']
                )
                
            except Exception as e:
                self.error_handler.handle_error(e, {'stage': 'main_loop'})
    
    @monitor.track_processing("batch")
    async def process_batch(self, documents: List[Dict]) -> Dict:
        """Process a batch of documents"""
        results = {'success': 0, 'errors': 0, 'skipped': 0}
        
        # Stage 1: Security validation
        documents = await self.security_stage(documents)
        
        # Stage 2: Quality validation
        valid_docs = []
        for doc in documents:
            if self.quality.validate_document(doc)['valid']:
                valid_docs.append(doc)
            else:
                results['errors'] += 1
        
        # Stage 3: Deduplication
        unique_docs = []
        for doc in valid_docs:
            if not self.dedup.is_duplicate(doc)[0]:
                unique_docs.append(doc)
            else:
                results['skipped'] += 1
        
        # Stage 4: Process and embed
        if unique_docs:
            processed = await self.processor.process_batch(unique_docs)
            embedded = await self.generate_embeddings_batch(processed)
            await self.vector_store.upsert_batch(embedded)
            results['success'] = len(embedded)
        
        return results`
    }
  ],
  assignments: [
    {
      id: 'production-pipeline',
      title: 'Build a Production-Ready Ingestion Pipeline',
      type: 'project',
      difficulty: 'hard',
      description: `Design and implement a complete production-ready ingestion pipeline that can handle:

1. **Multiple data sources** (S3, APIs, databases)
2. **High volume processing** (10,000+ documents/hour)
3. **Fault tolerance** with retry mechanisms
4. **Monitoring and alerting**
5. **Cost optimization**
6. **Security and compliance**

Requirements:
- Implement queue-based processing with Celery or similar
- Add comprehensive error handling and dead letter queues
- Include deduplication and incremental update logic
- Set up monitoring with Prometheus/Grafana
- Create Airflow DAG for orchestration
- Implement security measures (encryption, access control)
- Add data quality validation
- Include cost tracking and optimization

Deliverables:
- Complete pipeline code with all components
- Docker Compose setup for local testing
- Monitoring dashboard configuration
- Performance benchmarks
- Documentation with architecture diagram`,
      hints: [
        'Start with a simple pipeline and add components incrementally',
        'Use docker-compose to set up all required services locally',
        'Test failure scenarios thoroughly (network issues, malformed data)',
        'Profile your pipeline to identify bottlenecks',
        'Consider using LocalStack for testing AWS services'
      ]
    },
    {
      id: 'scalability-analysis',
      title: 'Pipeline Scalability Analysis',
      type: 'project',
      difficulty: 'medium',
      description: `Analyze and optimize an existing pipeline for scalability:

1. Profile the current pipeline performance
2. Identify bottlenecks using monitoring data
3. Implement parallel processing improvements
4. Add horizontal scaling capabilities
5. Optimize resource usage
6. Create load testing scenarios

Provide:
- Performance analysis report
- Optimization recommendations
- Before/after benchmarks
- Scaling strategy document`,
      hints: [
        'Use tools like cProfile for Python profiling',
        'Monitor CPU, memory, and I/O usage',
        'Test with different batch sizes',
        'Consider async processing where appropriate'
      ]
    }
  ],
  resources: [
    {
      title: 'Celery Documentation',
      url: 'https://docs.celeryproject.org/',
      type: 'documentation'
    },
    {
      title: 'Apache Airflow Best Practices',
      url: 'https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html',
      type: 'guide'
    },
    {
      title: 'Prometheus Monitoring Guide',
      url: 'https://prometheus.io/docs/practices/instrumentation/',
      type: 'documentation'
    },
    {
      title: 'Building Scalable Data Pipelines',
      url: 'https://www.oreilly.com/library/view/building-scalable-data/9781492057185/',
      type: 'book'
    },
    {
      title: 'Production-Ready Microservices',
      url: 'https://www.oreilly.com/library/view/production-ready-microservices/9781491965962/',
      type: 'book'
    }
  ]
}