import { CourseData, getCourseById } from './courses';

function toCamelCase(str: string): string {
  // Special handling for n8n -> n8n (keep lowercase)
  const words = str.split('-');
  return words.map((word, index) => {
    // Keep n8n and ai lowercase
    if (word === 'n8n' || word === 'ai') return word;
    // First word stays lowercase (camelCase), rest get capitalized
    return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
  }).join('');
}

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
    
    // Debug logging for n8n-make-basics
    if (courseId === 'n8n-make-basics') {
      console.log('Debug: Available exports for n8n-make-basics:', Object.keys(courseContent));
      console.log('Debug: Looking for:', `${toCamelCase(courseId)}Modules`);
    }
    
    // Check for default export
    if (courseContent.default) {
      modules = courseContent.default;
    } 
    // Check for named exports matching common patterns
    else if (courseContent.modules) {
      modules = courseContent.modules;
    } 
    // Try camelCase pattern (e.g., n8n-make-basics -> n8nMakeBasicsModules)
    else if (courseContent[`${toCamelCase(courseId)}Modules`]) {
      if (courseId === 'n8n-make-basics') {
        console.log('Found modules using camelCase pattern');
      }
      modules = courseContent[`${toCamelCase(courseId)}Modules`];
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
        console.log(`Using first export key '${firstExportKey}' for course ${courseId}`);
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
      console.log('Available exports:', Object.keys(courseContent));
      return course; // Return base course data which already has modules
    }
    
    // Additional validation - ensure modules have lessons
    const hasLessons = modules.some(module => module.lessons && module.lessons.length > 0);
    if (!hasLessons) {
      console.warn(`Course modules for ${courseId} have no lessons`);
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
