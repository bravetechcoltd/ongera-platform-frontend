export interface ProfileCompletionStatus {
  completed: boolean;
  percentage: number;
  missing: string[];
}

export const checkProfileCompletion = (user: any): ProfileCompletionStatus => {
  const missing: string[] = [];
  let completedCount = 0;
  let totalCount = 0;

  // Common basic fields
  totalCount++;
  if (user.first_name) completedCount++;
  else missing.push('first name');

  // Account type specific checks
  if (user.account_type === 'Institution') {
    // For institutions, bio and institution_description are the same
    totalCount++;
    if (user.bio || user.profile?.institution_description) completedCount++;
    else missing.push('institution description');

    // Institution-specific fields
    const institutionFields = [
      { key: 'profile.institution_name', label: 'institution name' },
      { key: 'profile.institution_address', label: 'institution address' },
      { key: 'profile.institution_phone', label: 'institution phone' },
      { key: 'profile.institution_type', label: 'institution type' },
      { key: 'profile.institution_website', label: 'institution website' },
      { key: 'profile.institution_founded_year', label: 'founded year' },
      { key: 'profile.institution_accreditation', label: 'accreditation' }
    ];

    institutionFields.forEach(({ key, label }) => {
      totalCount++;
      const value = key.split('.').reduce((obj, k) => obj?.[k], user);
      if (value) completedCount++;
      else missing.push(label);
    });
  } else {
    // For non-institution accounts (Student, Researcher, Diaspora, etc.)
    totalCount++;
    if (user.bio) completedCount++;
    else missing.push('bio');

    totalCount++;
    if (user.last_name) completedCount++;
    else missing.push('last name');

    const academicFields = [
      { key: 'profile.institution_name', label: 'institution name' },
      { key: 'profile.department', label: 'department' }
    ];

    academicFields.forEach(({ key, label }) => {
      totalCount++;
      const value = key.split('.').reduce((obj, k) => obj?.[k], user);
      if (value) completedCount++;
      else missing.push(label);
    });

    // Check research interests
    totalCount++;
    if (user.profile?.research_interests?.length > 0) completedCount++;
    else missing.push('research interests');

    // Diaspora specific fields
    if (user.account_type === 'Diaspora') {
      totalCount += 2;
      if (user.city) completedCount++;
      else missing.push('city');
      if (user.country) completedCount++;
      else missing.push('country');
    }
  }

  const percentage = Math.round((completedCount / totalCount) * 100);
  const completed = percentage === 100;

  return { completed, percentage, missing };
};