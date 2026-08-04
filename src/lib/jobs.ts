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

export interface MedicalJobSeeker {
  uid: string;
  email: string;
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  whatsapp: string;
  
  country: string;
  state: string;
  district: string;
  block: string;
  localAddress: string;
  pincode: string;
  
  primaryQualification: string;
  institution: string;
  passingYear: string;
  medicalRegNumber: string;
  medicalCouncil: string;
  additionalCerts: string[];
  
  isFresher: boolean;
  totalExperience: string;
  specialization: string;
  workHistory: { employer: string, role: string, duration: string, responsibilities: string }[];
  
  preferredJobType: string;
  expectedSalary: string;
  preferredLocation: string;
  
  profileImage: string;
  cvFileUrl?: string; // NEW: PDF Upload URL
  declarationSigned: boolean;
  isLookingForJob: boolean;
  createdAt: any;
}

export const jobsCollection = collection(db, "dehapa_jobs");
export const jobApplicationsCollection = collection(db, "dehapa_job_applications");
export const jobSeekersCollection = collection(db, "dehapa_job_seekers");
