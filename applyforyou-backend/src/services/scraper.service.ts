import axios from 'axios';
export interface JobListing { title: string; company: string; location: string; description: string; url: string; board: string; postedAt: Date; }

export const scrapeJobberman = async (keyword: string, location: string): Promise<JobListing[]> => {
  try {
    const response = await axios.get('https://www.jobberman.com/api/v3/jobs', {
      params: { q: keyword, l: location, page: 1, per_page: 20 },
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }, timeout: 10000
    });
    const jobs = response.data?.data || response.data?.jobs || [];
    return jobs.map((job: any) => ({ title: job.title || '', company: job.company || '', location: job.location || location, description: job.description || '', url: job.url || `https://www.jobberman.com/jobs/${job.id}`, board: 'Jobberman', postedAt: new Date(job.created_at || Date.now()) }));
  } catch { return []; }
};

export const scrapeMyJobMag = async (keyword: string, location: string): Promise<JobListing[]> => {
  try {
    const response = await axios.get('https://www.myjobmag.com/api/jobs/search', {
      params: { keyword, location, limit: 20 }, headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000
    });
    const jobs = response.data?.jobs || response.data?.data || [];
    return jobs.map((job: any) => ({ title: job.title || '', company: job.company || '', location: job.location || location, description: job.description || '', url: job.url || `https://www.myjobmag.com/job/${job.id}`, board: 'MyJobMag', postedAt: new Date(job.posted_date || Date.now()) }));
  } catch { return []; }
};

export const scrapeAllBoards = async (keyword: string, location: string, boards: string[]): Promise<JobListing[]> => {
  const scrapers: Record<string, () => Promise<JobListing[]>> = {
    'Jobberman': () => scrapeJobberman(keyword, location),
    'MyJobMag':  () => scrapeMyJobMag(keyword, location)
  };
  const results = await Promise.allSettled(boards.filter(b => scrapers[b]).map(b => scrapers[b]()));
  return results.filter((r): r is PromiseFulfilledResult<JobListing[]> => r.status === 'fulfilled').flatMap(r => r.value);
};
