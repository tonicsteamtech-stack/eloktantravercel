import { useQuery } from '@tanstack/react-query';

import { apiClient } from './client';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  constituency: string;
  education: string | null;
  criminalCases: number;
  assets: number;
  liabilities: number;
}

export const fetchCandidates = async (): Promise<Candidate[]> => {
  const { data } = await apiClient.get('/candidates');
  return data.candidates || [];
};

export const fetchCandidateById = async (id: string): Promise<Candidate> => {
  const { data } = await apiClient.get(`/candidates/${id}`);
  return data.candidate;
};

export const fetchCandidatesByConstituency = async (constituencyId: string): Promise<Candidate[]> => {
  const { data } = await apiClient.get(`/candidates/constituency/${constituencyId}`);
  return data.candidates || [];
};

export const useCandidates = () => {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: fetchCandidates,
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => fetchCandidateById(id),
    enabled: !!id,
  });
};

export const useConstituencyCandidates = (constituencyId: string) => {
  return useQuery({
    queryKey: ['constituencyCandidates', constituencyId],
    queryFn: () => fetchCandidatesByConstituency(constituencyId),
    enabled: !!constituencyId,
  });
};
