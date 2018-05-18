import { create } from 'command-bus'

//
// ─── COMMAND ────────────────────────────────────────────────────────────────────
//
export const PROCESS_ERROR = create<{ message: string }>('PROCESS_ERROR')

