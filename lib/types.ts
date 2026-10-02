import type { ObjectId } from "mongodb";
import type { Category } from "./categories";

export interface ExpenseDoc {
  _id?: ObjectId;
  profileName: string;
  category: Category;
  amount: number;
  date: Date;
  note: string | null;
  createdAt: Date;
}

export interface ExpenseDTO {
  id: string;
  profileName: string;
  category: Category;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
}

export interface MinimalExpenseForPrompt {
  category: Category;
  amount: number;
  date: Date;
  note: string | null;
}

export interface CheckinDoc {
  _id?: ObjectId;
  profileName: string;
  periodStart: Date;
  periodEnd: Date;
  totalSpend: number;
  categoryBreakdown: CategoryBreakdown[];
  aiSummary: string;
  topCategories: string[];
  tips: string[];
  model: string;
  generatedAt: Date;
}

export interface CheckinDTO {
  id: string;
  profileName: string;
  periodStart: string;
  periodEnd: string;
  totalSpend: number;
  categoryBreakdown: CategoryBreakdown[];
  aiSummary: string;
  topCategories: string[];
  tips: string[];
  model: string;
  generatedAt: string;
}

export function expenseToDTO(doc: ExpenseDoc & { _id: ObjectId }): ExpenseDTO {
  return {
    id: doc._id.toString(),
    profileName: doc.profileName,
    category: doc.category,
    amount: doc.amount,
    date: doc.date.toISOString(),
    note: doc.note,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function checkinToDTO(doc: CheckinDoc & { _id: ObjectId }): CheckinDTO {
  return {
    id: doc._id.toString(),
    profileName: doc.profileName,
    periodStart: doc.periodStart.toISOString(),
    periodEnd: doc.periodEnd.toISOString(),
    totalSpend: doc.totalSpend,
    categoryBreakdown: doc.categoryBreakdown,
    aiSummary: doc.aiSummary,
    topCategories: doc.topCategories,
    tips: doc.tips,
    model: doc.model,
    generatedAt: doc.generatedAt.toISOString(),
  };
}
