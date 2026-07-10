// src/lib/models/OrgChart.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgNode extends Document {
  id: string;
  label: string; 
  assignee: string; 
  description: string;
  parentId: string | null; 
}

const OrgNodeSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  assignee: { type: String, default: 'Unassigned' },
  description: { type: String, default: '' },
  parentId: { type: String, default: null }
}, { timestamps: true });

export default mongoose.models.OrgNode || mongoose.model<IOrgNode>('OrgNode', OrgNodeSchema);