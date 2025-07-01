# Performance Optimization Guidelines - GroeimetAI Platform MVP

## 1. Performance Benchmarks and Targets

### 1.1 Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds  
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8 seconds
- **Time to Interactive (TTI)**: < 3.5 seconds

### 1.2 Page Load Time Targets
- **Homepage**: < 2.0 seconds
- **Course Listing**: < 1.5 seconds
- **Course Detail**: < 1.0 seconds
- **Dashboard**: < 2.0 seconds
- **Assessment Pages**: < 1.0 seconds
- **Payment Pages**: < 1.5 seconds

### 1.3 API Response Time Targets
- **Authentication**: < 500ms
- **Course Data**: < 300ms
- **User Profile**: < 200ms
- **Payment Processing**: < 2000ms
- **File Uploads**: < 3000ms

### 1.4 Bundle Size Targets
- **Initial JavaScript Bundle**: < 250KB (gzipped)
- **Initial CSS Bundle**: < 50KB (gzipped)
- **Total Initial Load**: < 500KB (gzipped)
- **Individual Code Chunks**: < 100KB (gzipped)

## 2. Frontend Performance Optimization

### 2.1 React Performance Optimization
```javascript
// Implement React.memo for expensive components
import React, { memo, useMemo, useCallback } from 'react';

// Course card component with memoization
const CourseCard = memo(({ course, onEnroll }) => {
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(course.price);
  }, [course.price]);

  const handleEnroll = useCallback(() => {
    onEnroll(course.id);
  }, [course.id, onEnroll]);

  return (
    <div className="course-card">
      <img 
        src={course.thumbnail} 
        alt={course.title}
        loading="lazy"
        width="300"
        height="200"
      />
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <span className="price">{formattedPrice}</span>
      <button onClick={handleEnroll}>Enroll Now</button>
    </div>
  );
});

// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const CourseList = ({ courses }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CourseCard course={courses[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={courses.length}
      itemSize={350}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 2.2 Code Splitting and Lazy Loading
```javascript
// Route-based code splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Assessment = lazy(() => import('./pages/Assessment'));
const Payment = lazy(() => import('./pages/Payment'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/assessments/:id" element={<Assessment />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Suspense>
  );
}

// Component-level lazy loading
const HeavyComponent = lazy(() => 
  import('./components/HeavyComponent').then(module => ({
    default: module.HeavyComponent
  }))
);

// Image lazy loading with intersection observer
import { useIntersectionObserver } from './hooks/useIntersectionObserver';

const LazyImage = ({ src, alt, ...props }) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  return (
    <div ref={ref} {...props}>
      {isIntersecting && (
        <img 
          src={src} 
          alt={alt}
          loading="lazy"
          onLoad={() => console.log('Image loaded')}
        />
      )}
    </div>
  );
};
```

### 2.3 Bundle Optimization Configuration
```javascript
// vite.config.js - Optimized Vite configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
          
          // Feature chunks
          'course-pages': [
            './src/pages/Courses.jsx',
            './src/pages/CourseDetail.jsx',
            './src/components/CourseCard.jsx'
          ],
          'assessment-pages': [
            './src/pages/Assessment.jsx',
            './src/components/AssessmentQuestion.jsx'
          ],
          'payment-pages': [
            './src/pages/Payment.jsx',
            './src/components/PaymentForm.jsx'
          ]
        }
      }
    },
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app']
  }
});

// webpack.config.js alternative
const path = require('path');
const webpack = require('webpack');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 250000
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};
```

### 2.4 Image Optimization
```javascript
// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image sources
  generateSrcSet: (imagePath, sizes = [400, 800, 1200]) => {
    return sizes.map(size => 
      `${imagePath}?w=${size}&q=80&f=webp ${size}w`
    ).join(', ');
  },

  // Lazy loading with intersection observer
  useLazyLoading: (threshold = 0.1) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [ref, isIntersecting] = useIntersectionObserver({ threshold });

    useEffect(() => {
      if (isIntersecting && !isLoaded) {
        setIsLoaded(true);
      }
    }, [isIntersecting, isLoaded]);

    return [ref, isLoaded];
  },

  // Progressive image loading
  useProgressiveImage: (lowQualitySrc, highQualitySrc) => {
    const [src, setSrc] = useState(lowQualitySrc);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      const img = new Image();
      img.src = highQualitySrc;
      img.onload = () => {
        setSrc(highQualitySrc);
        setIsLoaded(true);
      };
    }, [highQualitySrc]);

    return [src, isLoaded];
  }
};

// Optimized image component
const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false 
}) => {
  const [ref, shouldLoad] = imageOptimization.useLazyLoading();
  const [imageSrc, isLoaded] = imageOptimization.useProgressiveImage(
    `${src}?w=50&q=20&blur=5`,
    src
  );

  if (priority) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="eager"
      />
    );
  }

  return (
    <div ref={ref} className={`image-container ${className}`}>
      {shouldLoad && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${isLoaded ? 'loaded' : 'loading'}`}
          loading="lazy"
          srcSet={imageOptimization.generateSrcSet(src)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  );
};
```

## 3. Backend Performance Optimization

### 3.1 Firebase Optimization
```javascript
// Optimized Firestore queries
class CourseService {
  // Use composite indexes for complex queries
  async getCoursesByCategory(category, limit = 20) {
    const coursesRef = collection(db, 'courses');
    const q = query(
      coursesRef,
      where('category', '==', category),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Implement pagination for large datasets
  async getCoursesWithPagination(lastDoc = null, limit = 20) {
    const coursesRef = collection(db, 'courses');
    let q = query(
      coursesRef,
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return { courses, lastVisible, hasMore: courses.length === limit };
  }

  // Batch operations for better performance
  async updateMultipleCourses(updates) {
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      const courseRef = doc(db, 'courses', id);
      batch.update(courseRef, data);
    });

    await batch.commit();
  }

  // Use subcollections for related data
  async getCourseWithLessons(courseId) {
    const courseRef = doc(db, 'courses', courseId);
    const lessonsRef = collection(courseRef, 'lessons');
    
    const [courseSnap, lessonsSnap] = await Promise.all([
      getDoc(courseRef),
      getDocs(query(lessonsRef, orderBy('order')))
    ]);

    return {
      ...courseSnap.data(),
      lessons: lessonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  }
}

// Implement caching strategy
class CacheService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  async getOrFetch(key, fetchFunction) {
    const cached = this.get(key);
    if (cached) return cached;

    const data = await fetchFunction();
    this.set(key, data);
    return data;
  }
}
```

### 3.2 Cloud Functions Optimization
```javascript
// Optimized Cloud Functions
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Use connection pooling
admin.initializeApp();
const db = admin.firestore();

// Optimize function memory and timeout
exports.processCourseEnrollment = functions
  .runWith({
    memory: '512MB',
    timeoutSeconds: 300
  })
  .firestore
  .document('payments/{paymentId}')
  .onCreate(async (snap, context) => {
    const paymentData = snap.data();
    
    if (paymentData.status !== 'succeeded') {
      return null;
    }

    const batch = db.batch();
    
    // Create enrollment
    const enrollmentRef = db.collection('enrollments').doc();
    batch.set(enrollmentRef, {
      userId: paymentData.userId,
      courseId: paymentData.courseId,
      paymentId: context.params.paymentId,
      enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    });

    // Update course enrollment count
    const courseRef = db.doc(`courses/${paymentData.courseId}`);
    batch.update(courseRef, {
      enrollmentCount: admin.firestore.FieldValue.increment(1)
    });

    // Update user enrolled courses
    const userRef = db.doc(`users/${paymentData.userId}`);
    batch.update(userRef, {
      enrolledCourses: admin.firestore.FieldValue.arrayUnion(paymentData.courseId)
    });

    await batch.commit();
    
    // Send confirmation email (async)
    return sendEnrollmentConfirmation(paymentData.userId, paymentData.courseId);
  });

// Implement background processing for heavy tasks
exports.generateCertificate = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 540
  })
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { courseId } = data;
    const userId = context.auth.uid;

    // Check if user completed the course
    const completionRef = db.doc(`users/${userId}/completions/${courseId}`);
    const completionSnap = await completionRef.get();

    if (!completionSnap.exists || !completionSnap.data().passed) {
      throw new functions.https.HttpsError('failed-precondition', 'Course not completed');
    }

    // Generate certificate in background
    const certificateUrl = await generateCertificatePDF(userId, courseId);
    
    // Update user document
    await db.doc(`users/${userId}`).update({
      [`certificates.${courseId}`]: {
        url: certificateUrl,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    return { certificateUrl };
  });
```

## 4. Database Performance Optimization

### 4.1 Firestore Optimization Strategies
```javascript
// Efficient data modeling
const firestoreOptimization = {
  // Denormalize frequently accessed data
  createOptimizedCourseDocument: (course) => ({
    // Core course data
    ...course,
    
    // Denormalized instructor data for quick access
    instructor: {
      id: course.instructorId,
      name: course.instructorName,
      avatar: course.instructorAvatar
    },
    
    // Aggregated data to avoid subcollection queries
    stats: {
      enrollmentCount: 0,
      averageRating: 0,
      reviewCount: 0,
      completionRate: 0
    },
    
    // Optimize for search
    searchTerms: [
      course.title.toLowerCase(),
      course.category.toLowerCase(),
      ...course.tags.map(tag => tag.toLowerCase())
    ]
  }),

  // Use arrays for simple many-to-many relationships
  addUserToCourse: async (userId, courseId) => {
    const batch = db.batch();
    
    // Add course to user's enrolled courses
    const userRef = db.doc(`users/${userId}`);
    batch.update(userRef, {
      enrolledCourses: admin.firestore.FieldValue.arrayUnion(courseId)
    });
    
    // Add user to course's enrolled users
    const courseRef = db.doc(`courses/${courseId}`);
    batch.update(courseRef, {
      enrolledUsers: admin.firestore.FieldValue.arrayUnion(userId),
      enrollmentCount: admin.firestore.FieldValue.increment(1)
    });
    
    await batch.commit();
  },

  // Optimize read operations with composite indexes
  createCompositeIndexes: () => {
    // Create these indexes in Firebase Console:
    // courses: category (ASC), status (ASC), createdAt (DESC)
    // enrollments: userId (ASC), enrolledAt (DESC)
    // assessments: courseId (ASC), userId (ASC), completedAt (DESC)
    // payments: userId (ASC), status (ASC), createdAt (DESC)
  }
};
```

### 4.2 Query Optimization
```javascript
// Optimized query patterns
class OptimizedQueries {
  // Use inequality filters efficiently
  async getActiveCourses(priceRange) {
    const coursesRef = collection(db, 'courses');
    const q = query(
      coursesRef,
      where('status', '==', 'published'),
      where('price', '>=', priceRange.min),
      where('price', '<=', priceRange.max),
      orderBy('price'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    return getDocs(q);
  }

  // Implement efficient search
  async searchCourses(searchTerm, category = null) {
    const coursesRef = collection(db, 'courses');
    let q = query(
      coursesRef,
      where('searchTerms', 'array-contains', searchTerm.toLowerCase()),
      where('status', '==', 'published')
    );

    if (category) {
      q = query(q, where('category', '==', category));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Use subcollections for large datasets
  async getUserProgress(userId, courseId) {
    const progressRef = collection(db, `users/${userId}/progress`);
    const q = query(
      progressRef,
      where('courseId', '==', courseId),
      orderBy('lastUpdated', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].data();
  }

  // Batch reads for related data
  async getCoursesWithInstructors(courseIds) {
    const courseRefs = courseIds.map(id => doc(db, 'courses', id));
    const courseSnaps = await Promise.all(courseRefs.map(ref => getDoc(ref)));
    
    const courses = courseSnaps
      .filter(snap => snap.exists())
      .map(snap => ({ id: snap.id, ...snap.data() }));

    // Get unique instructor IDs
    const instructorIds = [...new Set(courses.map(course => course.instructorId))];
    const instructorRefs = instructorIds.map(id => doc(db, 'users', id));
    const instructorSnaps = await Promise.all(instructorRefs.map(ref => getDoc(ref)));
    
    const instructors = instructorSnaps
      .filter(snap => snap.exists())
      .reduce((acc, snap) => {
        acc[snap.id] = snap.data();
        return acc;
      }, {});

    // Combine course and instructor data
    return courses.map(course => ({
      ...course,
      instructor: instructors[course.instructorId]
    }));
  }
}
```

## 5. Caching Strategies

### 5.1 Browser Caching
```javascript
// Service Worker for caching
// sw.js
const CACHE_NAME = 'groeimetai-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Cache API responses with TTL
class APICache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  async get(url) {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    return null;
  }

  set(url, data) {
    this.cache.set(url, {
      data,
      timestamp: Date.now()
    });
  }

  async fetchWithCache(url, options) {
    const cached = await this.get(url);
    if (cached) return cached;

    const response = await fetch(url, options);
    const data = await response.json();
    this.set(url, data);
    return data;
  }
}
```

### 5.2 Application-Level Caching
```javascript
// React Query for server state caching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Course data with caching
export const useCourses = (category) => {
  return useQuery({
    queryKey: ['courses', category],
    queryFn: () => fetchCourses(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Optimistic updates for better UX
export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: enrollInCourse,
    onMutate: async (newEnrollment) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['enrollments']);
      
      // Snapshot previous value
      const previousEnrollments = queryClient.getQueryData(['enrollments']);
      
      // Optimistically update
      queryClient.setQueryData(['enrollments'], old => [
        ...old,
        { ...newEnrollment, status: 'pending' }
      ]);
      
      return { previousEnrollments };
    },
    onError: (err, newEnrollment, context) => {
      // Rollback on error
      queryClient.setQueryData(['enrollments'], context.previousEnrollments);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries(['enrollments']);
    }
  });
};

// Context-based caching for user data
const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cachedData = localStorage.getItem('userData');
    if (cachedData) {
      setUserData(JSON.parse(cachedData));
      setIsLoading(false);
    }

    // Fetch fresh data
    fetchUserData().then(data => {
      setUserData(data);
      localStorage.setItem('userData', JSON.stringify(data));
      setIsLoading(false);
    });
  }, []);

  return (
    <UserDataContext.Provider value={{ userData, isLoading, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};
```

## 6. Performance Monitoring

### 6.1 Real User Monitoring (RUM)
```javascript
// Performance monitoring setup
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.initializeObservers();
  }

  initializeObservers() {
    // Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.sendMetric.bind(this));
      getFID(this.sendMetric.bind(this));
      getFCP(this.sendMetric.bind(this));
      getLCP(this.sendMetric.bind(this));
      getTTFB(this.sendMetric.bind(this));
    });

    // Custom metrics
    this.observeCustomMetrics();
  }

  observeCustomMetrics() {
    // Course loading time
    performance.mark('course-load-start');
    
    // API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const end = performance.now();
      
      this.sendMetric({
        name: 'api-response-time',
        value: end - start,
        url: args[0]
      });
      
      return response;
    };
  }

  sendMetric(metric) {
    // Send to analytics service
    console.log('Performance metric:', metric);
    
    // Send to Firebase Analytics
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        custom_parameter: metric.url || 'unknown'
      });
    }
  }

  // Custom performance markers
  markFeatureStart(featureName) {
    performance.mark(`${featureName}-start`);
  }

  markFeatureEnd(featureName) {
    performance.mark(`${featureName}-end`);
    performance.measure(featureName, `${featureName}-start`, `${featureName}-end`);
    
    const measure = performance.getEntriesByName(featureName)[0];
    this.sendMetric({
      name: featureName,
      value: measure.duration
    });
  }
}

// Initialize monitoring
const monitor = new PerformanceMonitor();

// Usage in components
const CourseList = () => {
  useEffect(() => {
    monitor.markFeatureStart('course-list-render');
    return () => monitor.markFeatureEnd('course-list-render');
  }, []);

  // Component logic...
};
```

### 6.2 Performance Budget Monitoring
```javascript
// performance-budget.js
const performanceBudget = {
  metrics: {
    'first-contentful-paint': 1800,
    'largest-contentful-paint': 2500,
    'first-input-delay': 100,
    'cumulative-layout-shift': 0.1,
    'total-blocking-time': 300
  },
  
  resources: {
    'main-bundle': 250 * 1024, // 250KB
    'css-bundle': 50 * 1024,   // 50KB
    'images-total': 500 * 1024, // 500KB
    'fonts-total': 100 * 1024   // 100KB
  },

  check(metric, value) {
    const budget = this.metrics[metric] || this.resources[metric];
    if (!budget) return true;

    const passed = value <= budget;
    if (!passed) {
      console.warn(`Performance budget exceeded for ${metric}: ${value} > ${budget}`);
    }
    return passed;
  },

  report() {
    // Generate performance report
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {},
      resources: {},
      passed: true
    };

    // Check all metrics
    Object.keys(this.metrics).forEach(metric => {
      // Get actual metric value
      const value = this.getMetricValue(metric);
      report.metrics[metric] = {
        value,
        budget: this.metrics[metric],
        passed: this.check(metric, value)
      };
      if (!report.metrics[metric].passed) {
        report.passed = false;
      }
    });

    return report;
  }
};

// CI/CD integration
const checkPerformanceBudget = async () => {
  const report = performanceBudget.report();
  
  if (!report.passed) {
    console.error('Performance budget check failed:', report);
    process.exit(1);
  }
  
  console.log('Performance budget check passed:', report);
};
```

## 7. Performance Testing Scripts

### 7.1 Automated Performance Testing
```bash
#!/bin/bash
# performance-test.sh

echo "Starting performance tests..."

# Build the application
npm run build

# Start the application
npm start &
APP_PID=$!

# Wait for application to start
sleep 10

# Run Lighthouse CI
npx lhci autorun

# Run load testing
npx artillery run load-test.yml

# Run bundle analysis
npx webpack-bundle-analyzer build/static/js/*.js

# Clean up
kill $APP_PID

echo "Performance tests completed."
```

### 7.2 Lighthouse CI Configuration
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/courses',
        'http://localhost:3000/dashboard'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

---

*These performance optimization guidelines provide a comprehensive approach to ensuring the GroeimetAI platform delivers excellent user experience through optimized loading times, efficient resource usage, and smooth interactions.*