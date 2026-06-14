export function slugify(text: string | undefined | null): string {
  if (!text) return 'all';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

export function generateDoctorSeoUrl(doctor: {
  id: string;
  name?: string;
  country?: string;
  state?: string;
  district?: string;
}): string {
  const countrySlug = slugify(doctor.country || 'india');
  const stateSlug = slugify(doctor.state || 'odisha');
  const districtSlug = slugify(doctor.district || 'all');
  const nameSlug = slugify(doctor.name || 'doctor');

  return `/doctors/${countrySlug}/${stateSlug}/${districtSlug}/${nameSlug}-${doctor.id}`;
}
