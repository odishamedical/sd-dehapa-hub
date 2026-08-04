import { db } from "./firebase";
import { collection } from "firebase/firestore";

export interface Job {
  id?: string;
  shopId: string; // The user ID or 'platform' for Admin jobs
  shopName: string;
  companyLogo?: string;
  industry: string; // E.g., Hospital, Pharmacy
  companyWebsite?: string;
  companyAddress: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp?: string;
  
  title: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
  location: string;
  salaryRange: string;
  experience: string;
  qualification: string;
  skillsRequired: string[];
  vacancies: number;
  deadline: string;
  
  description: string;
  keyResponsibilities: string;
  benefits: string[];
  workSchedule: string;
  additionalNotes?: string;
  
  status: 'Pending' | 'Active' | 'Closed' | 'Rejected';
  isDraft: boolean;
  createdAt: any;
}

export const jobsCollection = collection(db, "dehapa_jobs");
export const jobApplicationsCollection = collection(db, "dehapa_job_applications");
