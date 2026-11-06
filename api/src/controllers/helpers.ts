import { Request } from "express";

export const parseId = (req: Request): number => {
  const paramId = req.params.id;
  return Array.isArray(paramId) ? Number(paramId[0]) : Number(paramId);
};

export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);
