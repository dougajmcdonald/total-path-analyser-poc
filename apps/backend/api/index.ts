// This file is for Vercel only. It reuses the Express app, but does NOT call listen().
import { createApp } from '../src/app';

// Vercel Node runtime can accept an Express app as the default export:
export default createApp();