import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDocument {
    name: string;
    url: string;
    type: "pitch_deck" | "business_plan" | "financial_statement" | "legal_doc" | "video" | "other";
    cloudinaryId?: string;
    size?: number;
    uploadedAt: Date;
}

export interface ISubmission extends Document {
    entrepreneurId: Types.ObjectId;
    title: string;
    problem: {
        statement: string;
        targetMarket: string;
        marketSize: string;
    };
    solution: {
        description: string;
        uniqueValue: string;
        competitiveAdvantage: string;
    };
    businessModel: {
        revenueStreams: string;
        pricingStrategy: string;
        customerAcquisition: string;
    };
    financials: {
        currentRevenue: string;
        projectedRevenue: string;
        burnRate: string;
        runway: string;
    };
    sector: string;
    targetAmount: number;
    summary: string;
    status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
    documents: IDocument[];
    aiScore?: number;
    aiAnalysis?: Record<string, unknown>;
    currentStep: number;
    submittedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const documentSchema = new Schema<IDocument>({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: {
        type: String,
        enum: ["pitch_deck", "business_plan", "financial_statement", "legal_doc", "video", "other"],
        default: "other",
    },
    cloudinaryId: { type: String },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
});

const submissionSchema = new Schema<ISubmission>(
    {
        entrepreneurId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        problem: {
            statement: { type: String, default: "" },
            targetMarket: { type: String, default: "" },
            marketSize: { type: String, default: "" },
        },
        solution: {
            description: { type: String, default: "" },
            uniqueValue: { type: String, default: "" },
            competitiveAdvantage: { type: String, default: "" },
        },
        businessModel: {
            revenueStreams: { type: String, default: "" },
            pricingStrategy: { type: String, default: "" },
            customerAcquisition: { type: String, default: "" },
        },
        financials: {
            currentRevenue: { type: String, default: "" },
            projectedRevenue: { type: String, default: "" },
            burnRate: { type: String, default: "" },
            runway: { type: String, default: "" },
        },
        sector: {
            type: String,
            enum: [
                "technology", "healthcare", "fintech", "education", "agriculture",
                "energy", "real_estate", "manufacturing", "retail", "other",
            ],
            default: "other",
        },
        targetAmount: { type: Number, min: 0 },
        summary: { type: String, default: "", maxlength: 1000 },
        status: {
            type: String,
            enum: ["draft", "submitted", "under_review", "approved", "rejected"],
            default: "draft",
        },
        documents: [documentSchema],
        aiScore: { type: Number, min: 0, max: 100 },
        aiAnalysis: { type: Schema.Types.Mixed },
        currentStep: { type: Number, default: 1, min: 1, max: 5 },
        submittedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

submissionSchema.index({ status: 1, createdAt: -1 });
submissionSchema.index({ sector: 1 });

export default mongoose.model<ISubmission>("Submission", submissionSchema);
