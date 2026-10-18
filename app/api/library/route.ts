import {NextResponse} from "next/server";
export async function GET(){return NextResponse.json({configured:false,files:[]});}
export async function POST(){return NextResponse.json({error:"Cloud uploads are disabled without user authentication"},{status:405});}
