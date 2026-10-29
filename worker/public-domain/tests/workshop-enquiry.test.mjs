import test from 'node:test';import assert from 'node:assert/strict';
import {workshopEnquiryMail} from '../public-domain/workshop-enquiry.mjs';
test('workshop enquiry prepares an encoded email only, preserving names and keeping a fixed recipient',()=>{
 const u=new URL(workshopEnquiryMail({session:'guided-meditation',company:'Art & Co = Team + One',size:'12',date:'2026-11-10',location:'Dubai, UAE',notes:'Please include materials.\nReply to the team.'}));
 assert.equal(u.protocol,'mailto:');assert.equal(u.pathname,'hello@communiverseclubs.com');assert.equal(u.searchParams.get('subject'),'Corporate workshop enquiry - Guided meditation with Luna');assert(u.searchParams.get('body').includes('Art & Co = Team + One'));assert(u.searchParams.get('body').includes('Number of people: 12'));assert(u.searchParams.get('body').includes('Please include materials.\nReply to the team.'));assert.equal(u.searchParams.size,2);
 const malicious=new URL(workshopEnquiryMail({session:'other@example.com?bcc=bad',company:'test&bcc=bad@example.com'}));assert.equal(malicious.pathname,'hello@communiverseclubs.com');assert.equal(malicious.searchParams.get('bcc'),null);assert(malicious.searchParams.get('subject').endsWith('Help me choose'));
});
