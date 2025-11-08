# Developer Guidelines and Policies

Official guidelines for building and submitting apps for ChatGPT.

## Table of Contents
1. [Overview](#overview)
2. [App Fundamentals](#app-fundamentals)
3. [Safety Requirements](#safety-requirements)
4. [Privacy Requirements](#privacy-requirements)
5. [Developer Verification](#developer-verification)
6. [Submission Process](#submission-process)

---

## Overview

### Purpose

The ChatGPT app ecosystem is built on **trust**. These guidelines set the policies every developer must review and follow.

### What Makes a Great ChatGPT App

- ✅ **Does something clearly valuable**: Makes ChatGPT substantially better at specific task
- ✅ **Respects users' privacy**: Collects only necessary data, users control what's shared
- ✅ **Behaves predictably**: Does exactly what it says, no surprises
- ✅ **Is safe for broad audience**: Complies with usage policies, handles unsafe requests
- ✅ **Is accountable**: Verified developer stands behind work, provides support

### Distribution Standards

**Minimum Standard (Searchable & Shareable)**:
- Meet all requirements in this document
- App is searchable in directory
- Can be shared via direct links

**Enhanced Distribution (Merchandising & Proactive Suggestions)**:
- Meet all minimum requirements
- Meet higher standards in [design guidelines](01-core-concepts.md#design-guidelines)
- Consistent layout, interaction, visual style
- Simple to use, clearly valuable

### Current Status

- **Preview Available**: Start building today (January 2025)
- **Submissions Open**: Later in 2025
- **Guidelines Status**: Early preview, may evolve
- **Monetization**: Details coming soon

---

## App Fundamentals

### Purpose and Originality

**Requirements**:
- ✅ Serve clear purpose
- ✅ Reliably do what promised
- ✅ Only use IP you own or have permission to use
- ❌ No misleading or copycat designs
- ❌ No impersonation
- ❌ No spam or static frames
- ❌ No implying endorsement by OpenAI

### Quality and Reliability

**Requirements**:
- ✅ Behave predictably and reliably
- ✅ Results accurate and relevant to input
- ✅ Well-handled errors with clear messaging
- ✅ Thoroughly tested for stability and responsiveness
- ✅ Low latency across scenarios
- ❌ No crashes, hangs, or inconsistent behavior
- ❌ No betas, trials, or demos

**Testing Checklist**:
- [ ] Test across all supported display modes
- [ ] Test error handling (network, auth, invalid input)
- [ ] Test with various user inputs
- [ ] Verify performance under load
- [ ] Check mobile and desktop experiences

### Metadata

**Requirements**:
- ✅ Clear, accurate app names and descriptions
- ✅ Screenshots show only real functionality
- ✅ Tool titles make purpose obvious
- ✅ Indicate if tool is read-only or makes changes

**Examples**:

✅ Good Tool Title:
```
"Create Task" (clearly indicates write action)
"Search Public Documents" (clearly read-only)
```

❌ Bad Tool Title:
```
"Tool" (vague)
"Do Something" (unclear)
```

### Authentication and Permissions

**Requirements**:
- ✅ Transparent and explicit auth flow
- ✅ Clearly inform users of all permissions
- ✅ Limit requests to strictly necessary
- ✅ Provide demo account credentials for submission

**Example Permission Request**:
```
"This app needs access to:
- Your email address (to identify your account)
- Read and write access to your tasks (to manage your kanban board)"
```

---

## Safety Requirements

### Usage Policies

**Requirements**:
- ✅ Comply with [OpenAI usage policies](https://openai.com/policies/usage-policies/)
- ✅ Stay current with evolving requirements
- ✅ Ensure ongoing compliance
- ❌ No prohibited activities
- ❌ No facilitation of prohibited activities

**Consequences**:
- Previously approved apps violating policies will be removed

### Appropriateness

**Requirements**:
- ✅ Suitable for general audiences (ages 13+)
- ❌ Cannot explicitly target children under 13
- ⏳ Mature (18+) experiences: Coming when age verification available

### Respect User Intent

**Requirements**:
- ✅ Directly address user's request
- ❌ No unrelated content insertion
- ❌ No interaction redirection
- ❌ No unnecessary data collection

**Examples**:

✅ Good:
```
User: "Show me pizza places nearby"
App: Returns relevant pizza restaurants
```

❌ Bad:
```
User: "Show me pizza places nearby"
App: Returns pizza places + ads for car insurance
```

### Fair Play

**Requirements**:
- ❌ No discouraging use of other apps
- ❌ No interfering with fair discovery
- ❌ No diminishing ChatGPT experience
- ✅ Accurate value description without disparaging alternatives

**Prohibited in Metadata**:
```
❌ "Prefer this app over others"
❌ "The only app you need for X"
❌ "Better than [competitor]"
```

### Third-Party Content and Integrations

**Requirements**:
- ✅ Proper authorization for external website access
- ✅ Comply with third-party terms of service
- ❌ No web scraping without permission
- ❌ No API restriction bypass
- ❌ No circumventing access controls or rate limits

---

## Privacy Requirements

### Privacy Policy

**Requirements**:
- ✅ Clear, published privacy policy
- ✅ Explain exactly what data is collected
- ✅ Explain how data is used
- ✅ Follow policy at all times
- ✅ Users can review before installation

### Data Collection

#### Minimization
**Requirements**:
- ✅ Gather only minimum data required
- ✅ Inputs specific and narrowly scoped
- ✅ Clearly linked to task
- ❌ No "just in case" fields
- ❌ No broad profile data

**Example**:

✅ Good Input Schema:
```json
{
  "city": "string",
  "check_in_date": "string",
  "check_out_date": "string"
}
```

❌ Bad Input Schema:
```json
{
  "user_profile": "object",  // Too broad
  "all_preferences": "object",  // Unnecessary
  "browsing_history": "array"  // Not needed
}
```

#### Sensitive Data
**Prohibited**:
- ❌ Payment card information (PCI)
- ❌ Protected health information (PHI)
- ❌ Government identifiers (SSN, passport numbers)
- ❌ API keys
- ❌ Passwords

#### Data Boundaries

**Location Data**:
- ❌ Don't request raw location in input schema
- ✅ Obtain through client's controlled side channel
- ✅ Use environment metadata or referenced resource
- ✅ Ensures policy and consent applied before exposure

**Chat Log**:
- ❌ Cannot pull, reconstruct, or infer full chat log
- ✅ Operate only on explicit snippets and resources
- ✅ Client/model chooses what to send

### Transparency and User Control

#### Data Practices
**Requirements**:
- ❌ No surveillance, tracking, or behavioral profiling
- ❌ No metadata collection (timestamps, IPs, query patterns) unless:
  - Explicitly disclosed
  - Narrowly scoped
  - Aligned with usage policies

#### Accurate Action Labels
**Requirements**:
- ✅ Mark any state-changing tool as write action
- ✅ Read-only tools must be side-effect-free and safe to retry
- ✅ Destructive actions require clear labels and confirmation

**Examples**:

Write Actions:
- Create, modify, delete
- Send email, post message
- Upload file, share document
- Place order, make payment

Read Actions:
- Search, list, view
- Get details, fetch data
- Calculate, analyze

#### Preventing Data Exfiltration
**Requirements**:
- ✅ Any data-sending action must be write action
- ✅ Requires user confirmation
- ✅ Can run in preview mode

**Examples of Data Exfiltration**:
- Posting messages
- Sending emails
- Uploading files
- Sharing to external services

---

## Developer Verification

### Verification Requirements

**For Submission**:
- ✅ Verified individual or organization
- ✅ Straightforward identity confirmation process (when submissions open)
- ✅ Affiliation verification for represented businesses

**Consequences of Violation**:
- ❌ Repeated misrepresentation: Removal from program
- ❌ Hidden behavior: Removal from program
- ❌ Gaming the system: Removal from program

### Support Contact Details

**Requirements**:
- ✅ Provide customer support contact details
- ✅ Where end users can reach you for help
- ✅ Keep information accurate and up to date

**Examples**:
- Support email: support@yourapp.com
- Help center: https://help.yourapp.com
- Contact form: https://yourapp.com/contact

---

## Submission Process

### Reviews and Checks

**Process**:
- Automated scans may be performed
- Manual reviews may be conducted
- Understand how app works
- Check for policy conflicts

**If Rejected or Removed**:
- You will receive feedback
- May have opportunity to appeal

### Maintenance and Removal

**Requirements**:
- ✅ Keep app active and stable
- ✅ Maintain compliance with policies

**Removal Reasons**:
- Inactive
- Unstable
- No longer compliant
- Legal concerns
- Security concerns
- Policy violations

**OpenAI Rights**:
- May reject or remove any app
- At any time
- For any reason
- Without notice

### Re-submission for Changes

**Important**:
- Tool names, signatures, descriptions are **locked** after listing
- To change or add tools: **Resubmit for review**

**What Requires Resubmission**:
- Adding new tools
- Changing tool names
- Modifying tool schemas
- Updating tool descriptions

**What Doesn't Require Resubmission** (typically):
- Component UI updates (if schema unchanged)
- Bug fixes in server logic
- Performance improvements

---

## Checklist for Submission

### Pre-Submission Checklist

- [ ] App tested thoroughly across scenarios
- [ ] No crashes, hangs, or errors
- [ ] Clear, accurate metadata
- [ ] Privacy policy published
- [ ] Only necessary data collected
- [ ] Auth flow transparent and minimal
- [ ] Demo account credentials prepared
- [ ] Complies with usage policies
- [ ] Appropriate for general audience
- [ ] No prohibited content or activities
- [ ] Support contact details provided
- [ ] Developer verification completed

### Design Checklist

- [ ] Follows display mode guidelines
- [ ] Uses system colors and typography
- [ ] Proper spacing and layout
- [ ] Accessible (WCAG AA)
- [ ] Supports light and dark themes
- [ ] No custom fonts or overrides
- [ ] Conversational and simple

### Technical Checklist

- [ ] HTTPS endpoint deployed
- [ ] MCP server responsive
- [ ] Tools properly registered
- [ ] Components render correctly
- [ ] Auth working (if applicable)
- [ ] State management tested
- [ ] Error handling robust
- [ ] Performance optimized

---

## Next Steps

With understanding of guidelines:
1. Build your app following requirements
2. Test thoroughly
3. Prepare for submission (later 2025)
4. Monitor for updates to guidelines

See also:
- Design Guidelines (`01-core-concepts.md`)
- Quick Start Guide (`08-quick-start.md`)
- Official Docs: https://developers.openai.com/apps-sdk/app-developer-guidelines
