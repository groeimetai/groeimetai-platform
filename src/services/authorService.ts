import { doc, collection, setDoc, getDoc, updateDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Author, CourseAuthor } from '../types';
import { getCourseById } from './courseService';

const COLLECTION_AUTHORS = 'authors';
const COLLECTION_COURSE_AUTHORS = 'course_authors';

// Get author by ID
export async function getAuthorById(authorId: string): Promise<Author | null> {
  try {
    const authorRef = doc(db, COLLECTION_AUTHORS, authorId);
    const authorDoc = await getDoc(authorRef);
    
    if (!authorDoc.exists()) {
      console.error(`Author with ID ${authorId} not found`);
      return null;
    }
    
    const data = authorDoc.data();
    return {
      id: authorDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Author;
  } catch (error) {
    console.error('Error fetching author:', error);
    throw error;
  }
}

// Create new author
export async function createAuthor(authorData: Omit<Author, 'id' | 'createdAt' | 'updatedAt'>): Promise<Author> {
  try {
    const authorId = `author_${Date.now()}`;
    const timestamp = Timestamp.now();
    
    const newAuthor = {
      ...authorData,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await setDoc(doc(db, COLLECTION_AUTHORS, authorId), newAuthor);
    
    return {
      id: authorId,
      ...authorData,
      createdAt: timestamp.toDate(),
      updatedAt: timestamp.toDate()
    };
  } catch (error) {
    console.error('Error creating author:', error);
    throw error;
  }
}

// Update author profile
export async function updateAuthorProfile(
  authorId: string, 
  updates: Partial<Omit<Author, 'id' | 'createdAt'>>
): Promise<Author> {
  try {
    const authorRef = doc(db, COLLECTION_AUTHORS, authorId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(authorRef, updateData);
    
    const updatedAuthor = await getAuthorById(authorId);
    if (!updatedAuthor) {
      throw new Error('Author not found after update');
    }
    
    return updatedAuthor;
  } catch (error) {
    console.error('Error updating author:', error);
    throw error;
  }
}

// Get all courses by author
export async function getAuthorCourses(authorId: string): Promise<any[]> {
  try {
    // First, get all course-author relationships for this author
    const courseAuthorsQuery = query(
      collection(db, COLLECTION_COURSE_AUTHORS),
      where('authorId', '==', authorId)
    );
    
    const courseAuthorsSnapshot = await getDocs(courseAuthorsQuery);
    
    if (courseAuthorsSnapshot.empty) {
      return [];
    }
    
    // Get all course IDs
    const courseIds = courseAuthorsSnapshot.docs.map(doc => doc.data().courseId);
    
    // Fetch all courses
    const coursesPromises = courseIds.map(courseId => getCourseById(courseId));
    const courses = await Promise.all(coursesPromises);
    
    // Filter out null values and return
    return courses.filter(course => course !== null);
  } catch (error) {
    console.error('Error fetching author courses:', error);
    throw error;
  }
}

// Calculate author revenue based on their courses and revenue share
export async function calculateAuthorRevenue(
  authorId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalRevenue: number;
  courseBreakdown: Array<{
    courseId: string;
    courseName: string;
    revenue: number;
    revenueShare: number;
    authorRevenue: number;
  }>;
}> {
  try {
    // Get author details
    const author = await getAuthorById(authorId);
    if (!author) {
      throw new Error('Author not found');
    }
    
    // Get all courses by this author
    const courses = await getAuthorCourses(authorId);
    
    // For each course, calculate revenue
    const courseBreakdown = await Promise.all(
      courses.map(async (course) => {
        // Get course-author relationship to check for custom revenue share
        const courseAuthorQuery = query(
          collection(db, COLLECTION_COURSE_AUTHORS),
          where('authorId', '==', authorId),
          where('courseId', '==', course.id)
        );
        
        const courseAuthorSnapshot = await getDocs(courseAuthorQuery);
        const courseAuthorData = courseAuthorSnapshot.docs[0]?.data() as CourseAuthor | undefined;
        
        // Use custom revenue share if available, otherwise use author's default
        const revenueShare = courseAuthorData?.revenueShare ?? author.revenueSharePercentage;
        
        // Get payments for this course within date range
        let paymentsQuery = query(
          collection(db, 'payments'),
          where('courseId', '==', course.id),
          where('status', '==', 'completed')
        );
        
        // Note: In production, you'd add date filters here if provided
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const courseRevenue = paymentsSnapshot.docs.reduce((sum, doc) => {
          const payment = doc.data();
          return sum + payment.amount;
        }, 0);
        
        const authorRevenue = (courseRevenue * revenueShare) / 100;
        
        return {
          courseId: course.id,
          courseName: course.title,
          revenue: courseRevenue,
          revenueShare: revenueShare,
          authorRevenue: authorRevenue
        };
      })
    );
    
    const totalRevenue = courseBreakdown.reduce((sum, course) => sum + course.authorRevenue, 0);
    
    return {
      totalRevenue,
      courseBreakdown
    };
  } catch (error) {
    console.error('Error calculating author revenue:', error);
    throw error;
  }
}

// Add author to course (create course-author relationship)
export async function addAuthorToCourse(
  courseId: string,
  authorId: string,
  role: CourseAuthor['role'] = 'primary',
  customRevenueShare?: number
): Promise<CourseAuthor> {
  try {
    const relationshipId = `${courseId}_${authorId}`;
    const timestamp = Timestamp.now();
    
    const courseAuthorData: Omit<CourseAuthor, 'addedAt'> & { addedAt: Timestamp } = {
      courseId,
      authorId,
      role,
      addedAt: timestamp
    };
    
    if (customRevenueShare !== undefined) {
      courseAuthorData.revenueShare = customRevenueShare;
    }
    
    await setDoc(doc(db, COLLECTION_COURSE_AUTHORS, relationshipId), courseAuthorData);
    
    return {
      ...courseAuthorData,
      addedAt: timestamp.toDate()
    };
  } catch (error) {
    console.error('Error adding author to course:', error);
    throw error;
  }
}

// Remove author from course
export async function removeAuthorFromCourse(courseId: string, authorId: string): Promise<void> {
  try {
    const relationshipId = `${courseId}_${authorId}`;
    await updateDoc(doc(db, COLLECTION_COURSE_AUTHORS, relationshipId), {
      deletedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error removing author from course:', error);
    throw error;
  }
}

// Get all authors
export async function getAllAuthors(): Promise<Author[]> {
  try {
    const authorsSnapshot = await getDocs(collection(db, COLLECTION_AUTHORS));
    
    return authorsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Author;
    });
  } catch (error) {
    console.error('Error fetching all authors:', error);
    throw error;
  }
}

// Search authors by name or expertise
export async function searchAuthors(searchTerm: string): Promise<Author[]> {
  try {
    // Note: This is a basic implementation. In production, you might want to use
    // a more sophisticated search solution like Algolia or Elasticsearch
    const allAuthors = await getAllAuthors();
    
    const lowercaseSearch = searchTerm.toLowerCase();
    
    return allAuthors.filter(author => 
      author.name.toLowerCase().includes(lowercaseSearch) ||
      author.bio.toLowerCase().includes(lowercaseSearch) ||
      author.expertise.some(exp => exp.toLowerCase().includes(lowercaseSearch))
    );
  } catch (error) {
    console.error('Error searching authors:', error);
    throw error;
  }
}

// Get authors for a specific course
export async function getCourseAuthors(courseId: string): Promise<Array<Author & { role: CourseAuthor['role'] }>> {
  try {
    const courseAuthorsQuery = query(
      collection(db, COLLECTION_COURSE_AUTHORS),
      where('courseId', '==', courseId)
    );
    
    const courseAuthorsSnapshot = await getDocs(courseAuthorsQuery);
    
    if (courseAuthorsSnapshot.empty) {
      return [];
    }
    
    const authorsPromises = courseAuthorsSnapshot.docs.map(async (doc) => {
      const courseAuthorData = doc.data() as CourseAuthor;
      const author = await getAuthorById(courseAuthorData.authorId);
      
      if (!author) return null;
      
      return {
        ...author,
        role: courseAuthorData.role
      };
    });
    
    const authors = await Promise.all(authorsPromises);
    
    // Filter out null values
    return authors.filter((author): author is Author & { role: CourseAuthor['role'] } => author !== null);
  } catch (error) {
    console.error('Error fetching course authors:', error);
    throw error;
  }
}