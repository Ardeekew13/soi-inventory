import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Check mongoose connection state
    const state = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];

    return NextResponse.json({
      success: true,
      message: `DB connection status: ${states[state]}`,
    });
  } catch (error) {
    console.error("DB connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to DB",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
