

import { ValidationError } from "./errors";


interface ValidationResult {
  isValid: boolean;
  errors: string[];
}


export const validateProfileUpdate = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (data.bio !== undefined) {
    if (typeof data.bio !== "string") {
      errors.push("Bio must be a string");
    } else if (data.bio.length > 500) {
      errors.push("Bio must not exceed 500 characters");
    }
  }

  
  if (data.location !== undefined) {
    if (typeof data.location !== "string") {
      errors.push("Location must be a string");
    } else if (data.location.length > 100) {
      errors.push("Location must not exceed 100 characters");
    }
  }


  if (data.website !== undefined) {
    if (typeof data.website !== "string") {
      errors.push("Website must be a string");
    } else if (data.website && !isValidUrl(data.website)) {
      errors.push("Website must be a valid URL");
    }
  }

  if (data.phone !== undefined) {
    if (typeof data.phone !== "string") {
      errors.push("Phone must be a string");
    } else if (data.phone && !isValidPhone(data.phone)) {
      errors.push("Phone must be a valid phone number");
    }
  }


  if (data.skills !== undefined) {
    if (!Array.isArray(data.skills)) {
      errors.push("Skills must be an array");
    } else {
      data.skills.forEach((skill: any, index: number) => {
        if (typeof skill !== "string") {
          errors.push(`Skill at index ${index} must be a string`);
        } else if (skill.length > 50) {
          errors.push(`Skill at index ${index} must not exceed 50 characters`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


export const validateSettingsUpdate = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (data.targetRole !== undefined) {
    if (typeof data.targetRole !== "string") {
      errors.push("Target role must be a string");
    } else if (data.targetRole.length > 100) {
      errors.push("Target role must not exceed 100 characters");
    }
  }

  if (data.experienceLevel !== undefined) {
    const validLevels = ["beginner", "intermediate", "advanced"];
    if (!validLevels.includes(data.experienceLevel)) {
      errors.push(
        `Experience level must be one of: ${validLevels.join(", ")}`
      );
    }
  }

  if (data.privacySettings !== undefined) {
    if (typeof data.privacySettings !== "object" || data.privacySettings === null) {
      errors.push("Privacy settings must be an object");
    } else {
      // Updated to match actual API response structure
      const booleanFields = ["showEmail", "showPhone"];
      booleanFields.forEach((field) => {
        if (
          data.privacySettings[field] !== undefined &&
          typeof data.privacySettings[field] !== "boolean"
        ) {
          errors.push(`Privacy setting '${field}' must be a boolean`);
        }
      });
      
      // Validate profileVisibility if provided
      if (data.privacySettings.profileVisibility !== undefined) {
        const validVisibilities = ["public", "private", "connections"];
        if (!validVisibilities.includes(data.privacySettings.profileVisibility)) {
          errors.push(`Profile visibility must be one of: ${validVisibilities.join(", ")}`);
        }
      }
    }
  }

  if (data.notificationPreferences !== undefined) {
    if (
      typeof data.notificationPreferences !== "object" ||
      data.notificationPreferences === null
    ) {
      errors.push("Notification preferences must be an object");
    } else {
      // Updated to match actual API response structure
      const booleanFields = [
        "emailNotifications",
        "pushNotifications",
      ];
      booleanFields.forEach((field) => {
        if (
          data.notificationPreferences[field] !== undefined &&
          typeof data.notificationPreferences[field] !== "boolean"
        ) {
          errors.push(`Notification preference '${field}' must be a boolean`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


export const validateQuizSubmission = (data: any): ValidationResult => {
  const errors: string[] = [];


  if (!data.answers) {
    errors.push("Answers are required");
  } else if (!Array.isArray(data.answers)) {
    errors.push("Answers must be an array");
  } else {
    data.answers.forEach((answer: any, index: number) => {
      if (typeof answer !== "object" || answer === null) {
        errors.push(`Answer at index ${index} must be an object`);
      } else {
        // Validate questionId
        if (!answer.questionId) {
          errors.push(`Answer at index ${index} must have a questionId`);
        } else if (typeof answer.questionId !== "string") {
          errors.push(`Answer at index ${index} questionId must be a string`);
        }

        // Validate selectedAnswer
        if (answer.selectedAnswer === undefined) {
          errors.push(`Answer at index ${index} must have a selectedAnswer`);
        } else if (typeof answer.selectedAnswer !== "string") {
          errors.push(`Answer at index ${index} selectedAnswer must be a string`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


export const validatePersonalInfoUpdate = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Validate name if provided
  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      errors.push("Name must be a string");
    } else if (data.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    } else if (data.name.length > 100) {
      errors.push("Name must not exceed 100 characters");
    }
  }

  // Validate email if provided
  if (data.email !== undefined) {
    if (typeof data.email !== "string") {
      errors.push("Email must be a string");
    } else if (!isValidEmail(data.email)) {
      errors.push("Email must be a valid email address");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidPhone = (phone: string): boolean => {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};


export const validateRequest = (
  validationFn: (data: any) => ValidationResult
) => {
  return (req: any, res: any, next: any) => {
    const result = validationFn(req.body);

    if (!result.isValid) {
      throw new ValidationError("Validation failed", result.errors);
    }

    next();
  };
};
