import { NextResponse } from 'next/server';
import {getJobEvidence} from '@/lib/job-evidence';
import {errorText} from '@/lib/public-github';
export const dynamic='force-dynamic';
export async function GET(){try{const result=await getJobEvidence();return NextResponse.json({...result.value,fetchedAt:result.fetchedAt,stale:result.stale,error:result.error},{headers:{'Cache-Control':'private, no-store'}});}catch(e){return NextResponse.json({jobs:[],approvals:[],fetchedAt:'',stale:true,error:errorText(e)},{status:503,headers:{'Cache-Control':'private, no-store'}});}}
