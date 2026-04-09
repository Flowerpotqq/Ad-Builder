# Output Schema

Return markdown only in this structure.

```md
# Email Output

## Meta
- Agent: <selected agent>
- Email Type: <email_type>
- Framework: <framework name>
- Tone: <tone mode>
- Assumptions: <comma-separated inferred assumptions or "none">

## Subject
<single subject line>

## Preview Text
<single preview text line, 35-90 chars preferred>

## Email Body
### Section 1: Preheader
- Purpose: <why this section exists>
- Copy: <preheader copy>

### Section 2: Hero
- Headline: <headline>
- Supporting Copy: <1-2 lines>
- CTA Label: <primary CTA label>
- CTA URL: <cta_link>

### Section 3: Core Content
- Block Type: <feature grid / steps / offer details / newsletter modules / confirmation details>
- Copy:
  - <bullet or short paragraph>
  - <bullet or short paragraph>

### Section 4: Proof or Reassurance
- Copy: <single concise proof or reassurance line>

### Section 5: Closing CTA
- Copy: <short closing line>
- CTA Label: <repeat or secondary if allowed>
- CTA URL: <cta_link>

### Section 6: Footer
- Reason for email: <why recipient got this>
- Preference/Unsubscribe: {{unsubscribe_url}}
- Company line: {{company_name}} | {{company_address}}
```

## Output constraints
- No section may be empty.
- Keep reading grade suitable for broad business audiences.
- Avoid markdown tables in final generated email output.
