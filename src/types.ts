export type Node = {
  segment: string;
  pathSegment: string;
  layout?: string;
  page?: string;
  error?: string;
  notFound?: string;
  loading?: string;
  children?: Node[];
};
