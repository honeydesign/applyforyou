import axios from 'axios';

export interface JobListing {
  title:       string;
  company:     string;
  location:    string;
  description: string;
  url:         string;
  board:       string;
  postedAt:    Date;
}

// ── JSearch API (RapidAPI) ─────────────────────────────────────
// Gives real jobs from Indeed, LinkedIn, Glassdoor
export const scrapeWithJSearch = async (keyword: string, location: string): Promise<JobListing[]> => {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      console.log('⚠️  No RAPIDAPI_KEY set — skipping JSearch');
      return [];
    }

    console.log(`🔍 JSearch: searching for ${keyword} in ${location}`);

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query:              `${keyword} in ${location}`,
        page:               '1',
        num_pages:          '1',
        date_posted:        'today',
        remote_jobs_only:   'false',
        employment_types:   'FULLTIME,PARTTIME,CONTRACTOR'
      },
      headers: {
        'X-RapidAPI-Key':  process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      timeout: 15000
    });

    const jobs = response.data?.data || [];
    console.log(`✅ JSearch: found ${jobs.length} jobs`);

    return jobs.map((job: any) => ({
      title:       job.job_title            || '',
      company:     job.employer_name        || '',
      location:    job.job_city             || job.job_country || location,
      description: job.job_description      || '',
      url:         job.job_apply_link       || job.job_google_link || '',
      board:       job.job_publisher        || 'Indeed',
      postedAt:    new Date(job.job_posted_at_datetime_utc || Date.now())
    })).filter((job: JobListing) => job.url && job.title);

  } catch (err: any) {
    console.error(`❌ JSearch failed:`, err.message);
    return [];
  }
};

// ── Jobicy API (free, no key needed for remote jobs) ───────────
export const scrapeJobicy = async (keyword: string): Promise<JobListing[]> => {
  try {
    console.log(`🔍 Jobicy: searching for ${keyword}`);

    const response = await axios.get('https://jobicy.com/api/v2/remote-jobs', {
      params: {
        count: 20,
        tag:   keyword.toLowerCase().replace(/ /g, '-')
      },
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });

    const jobs = response.data?.jobs || [];
    console.log(`✅ Jobicy: found ${jobs.length} remote jobs`);

    return jobs.map((job: any) => ({
      title:       job.jobTitle    || '',
      company:     job.companyName || '',
      location:    job.jobGeo      || 'Remote',
      description: job.jobExcerpt  || job.jobDescription || '',
      url:         job.url         || '',
      board:       'Jobicy (Remote)',
      postedAt:    new Date(job.pubDate || Date.now())
    })).filter((job: JobListing) => job.url && job.title);

  } catch (err: any) {
    console.error(`❌ Jobicy failed:`, err.message);
    return [];
  }
};

// ── RemoteOK API (free, no key needed) ────────────────────────
export const scrapeRemoteOK = async (keyword: string): Promise<JobListing[]> => {
  try {
    console.log(`🔍 RemoteOK: searching for ${keyword}`);

    const tag = keyword.toLowerCase().split(' ')[0];
    const response = await axios.get(`https://remoteok.com/api?tag=${tag}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept':     'application/json'
      },
      timeout: 10000
    });

    const jobs = (response.data || []).filter((j: any) => j.position);
    console.log(`✅ RemoteOK: found ${jobs.length} remote jobs`);

    return jobs.slice(0, 20).map((job: any) => ({
      title:       job.position    || '',
      company:     job.company     || '',
      location:    'Remote',
      description: job.description || job.tags?.join(', ') || '',
      url:         job.url         || `https://remoteok.com/remote-jobs/${job.id}`,
      board:       'RemoteOK',
      postedAt:    new Date(job.date || Date.now())
    })).filter((job: JobListing) => job.url && job.title);

  } catch (err: any) {
    console.error(`❌ RemoteOK failed:`, err.message);
    return [];
  }
};

// ── Arbeitnow API (free, no key needed) ───────────────────────
export const scrapeArbeitnow = async (keyword: string): Promise<JobListing[]> => {
  try {
    console.log(`🔍 Arbeitnow: searching for ${keyword}`);

    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
      params: { search: keyword },
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });

    const jobs = response.data?.data || [];
    console.log(`✅ Arbeitnow: found ${jobs.length} jobs`);

    return jobs.slice(0, 20).map((job: any) => ({
      title:       job.title       || '',
      company:     job.company_name || '',
      location:    job.location    || 'Remote',
      description: job.description || '',
      url:         job.url         || '',
      board:       'Arbeitnow',
      postedAt:    new Date(job.created_at || Date.now())
    })).filter((job: JobListing) => job.url && job.title);

  } catch (err: any) {
    console.error(`❌ Arbeitnow failed:`, err.message);
    return [];
  }
};

// ── Aggregate all boards ───────────────────────────────────────
export const scrapeAllBoards = async (
  keyword:  string,
  location: string,
  boards:   string[]
): Promise<JobListing[]> => {

  console.log(`\n🌐 Scraping all boards for: "${keyword}" in "${location}"`);

  // Run all scrapers in parallel
  const [jsearchJobs, jobicyJobs, remoteOKJobs, arbeitnowJobs] = await Promise.allSettled([
    scrapeWithJSearch(keyword, location),
    scrapeJobicy(keyword),
    scrapeRemoteOK(keyword),
    scrapeArbeitnow(keyword)
  ]);

  const allJobs = [
    ...(jsearchJobs.status  === 'fulfilled' ? jsearchJobs.value  : []),
    ...(jobicyJobs.status   === 'fulfilled' ? jobicyJobs.value   : []),
    ...(remoteOKJobs.status === 'fulfilled' ? remoteOKJobs.value : []),
    ...(arbeitnowJobs.status === 'fulfilled' ? arbeitnowJobs.value : [])
  ];

  // Remove duplicates by URL
  const unique = allJobs.filter((job, index, self) =>
    index === self.findIndex(j => j.url === job.url)
  ).filter(job => job.description.length > 50);

  console.log(`📋 Total unique jobs found: ${unique.length}`);
  return unique;
};