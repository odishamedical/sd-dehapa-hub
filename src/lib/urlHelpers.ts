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

export function generateUniversalSeoUrl(
  data: {
    id: string;
    name?: string;
    country?: string;
    state?: string;
    district?: string;
    customSlug?: string;
  },
  type: 'doctors' | 'hospitals' | 'labs' | 'pharmacies' | 'ambulances'
): string {
  // 1. Premium Custom Slug (Vanity URL)
  if (data.customSlug) {
    return `/${type}/${slugify(data.customSlug)}`;
  }

  // 2. Standard SEO Cascading URL
  const countrySlug = slugify(data.country || 'india');
  const stateSlug = slugify(data.state || 'odisha');
  const districtSlug = slugify(data.district || 'all');
  const nameSlug = slugify(data.name || type);

  return `/${type}/${countrySlug}/${stateSlug}/${districtSlug}/${nameSlug}-${data.id}`;
}
