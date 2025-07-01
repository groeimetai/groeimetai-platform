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
    } catch (e) {
      // Fallback to .ts extension for backward compatibility
      try {
        courseContent = await import(`./course-content/${courseId}.ts`);
      } catch (e2) {
        console.warn(`Could not import course content for ${courseId}:`, e2);
        return course;
      }
    }
    
    // Handle different export patterns
    let modules;
    
    // Check for default export
    if (courseContent.default) {
      modules = courseContent.default;
    } 
    // Check for named exports matching common patterns
    else if (courseContent.modules) {
      modules = courseContent.modules;
    } 
    else if (courseContent[`${courseId.replace(/-/g, '')}Modules`]) {
      // Handle exports like promptEngineeringModules
      modules = courseContent[`${courseId.replace(/-/g, '')}Modules`];
    }
    else if (courseContent[`${courseId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}Modules`]) {
      // Handle exports like promptEngineeringModules with proper casing
      modules = courseContent[`${courseId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}Modules`];
    }
    else {
      // Get the first export from the module
      const firstExportKey = Object.keys(courseContent).find(key => key !== '__esModule');
      if (firstExportKey) {
        modules = courseContent[firstExportKey];
      }
    }
    
    // Check if the export is a Course object with modules property
    if (modules && typeof modules === 'object' && 'modules' in modules && Array.isArray(modules.modules)) {
      modules = modules.modules;
    }
    
    // Validate that modules is an array
    if (!Array.isArray(modules)) {
      console.warn(`Course content for ${courseId} does not export a valid modules array, using base course modules`);
      return course; // Return base course data which already has modules
    }
    
    return {
      ...course,
      modules,
    };
  } catch (error) {
    console.warn(`Error loading detailed course content for ${courseId}, using base course data:`, error);
    // Return base course data which already has modules array
    return course;
  }
}
