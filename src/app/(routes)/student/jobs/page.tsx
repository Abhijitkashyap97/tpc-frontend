"use client";
import React, { useEffect, useState } from "react";
import JobCard from "@/components/jobs/JobCard";
import { GetJobs } from "@/helpers/student/api";
import { Jobs } from "@/helpers/student/types";
import toast from "react-hot-toast";
import Loader from "@/components/Loader/loader";
const StudentPage = () => {
  const [jobs, setJobs] = useState<Jobs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await GetJobs();
        setJobs(data);
      } catch (error) {
        toast.error("Error fetching data:");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div>
      <div className="my-3 mx-5 font-bold text-xl">
        <h1>Jobs</h1>
      </div>
      <div>
        {loading && (
          <div className="h-screen w-full flex justify-center items-center">
            <Loader />
          </div>
        )}
        {jobs ? (
          jobs.map((job) => (
            <div key={job.id} className="my-3">
              <JobCard jobItem={job} type="job" />
            </div>
          ))
        ) : (
          <div className="h-screen w-full flex justify-center items-center">
            <h1 className="text-2xl font-bold">No Jobs Available</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPage;
