import { CourseData, getCourseById } from './courses';

export async function getCourseWithContent(courseId: string): Promise<CourseData | null> {
  const course = getCourseById(courseId);
  if (!course) {
    console.error(`Course not found: ${courseId}`);
    return null;
  }

  // Check if course already has modules
  if (!course.modules || !Array.isArray(course.modules)) {
    console.error(`Base course data for ${courseId} has invalid modules:`, course.modules);
    return {
      ...course,
      modules: []
    };
  }

  try {
    // Try importing as a directory first (with index.ts), then as a single file
    let courseContent;
    try {
      courseContent = await import(`./course-content/${courseId}`);
    } catch {
      // Fallback to .ts extension for backward compatibility
      courseContent = await import(`./course-content/${courseId}.ts`);
    }
    
    // Get the first export from the module
    const firstExportKey = Object.keys(courseContent)[0];
    let modules = courseContent[firstExportKey];
    
    // Check if the export is a Course object with modules property
    if (modules && typeof modules === 'object' && 'modules' in modules && Array.isArray(modules.modules)) {
      modules = modules.modules;
    }
    
    // Validate that modules is an array
    if (!Array.isArray(modules)) {
      console.warn(`Course content for ${courseId} does not export a modules array, using base course modules`);
      return course; // Return base course data which already has modules
    }
    
    return {
      ...course,
      modules,
    };
  } catch (error) {
    console.warn(`Error loading detailed course content for ${courseId}, using base course data:`, error.message);
    // Return base course data which already has modules array
    return course;
  }
}
