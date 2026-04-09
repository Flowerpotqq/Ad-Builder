# Input Schema

Use this normalized request contract before generation.

```yaml
name: string
business_type: string
offer: string
cta_link: string
email_type: promotional | welcome | newsletter | transactional | reengagement | launch | followup
campaign_goal: string
audience_segment: string
product_name: string
key_benefits:
  - string
proof_points:
  - string
brand_voice: saas_professional | friendly_onboarding | urgency_promo | conversational_sales
urgency_window: string
send_context: cold | warm | existing_customer | trial_user
constraints:
  max_words: number
  include_discount_terms: boolean
  include_social_proof: boolean
  include_secondary_cta: boolean
```

## Required fields
- `name`
- `business_type`
- `offer`
- `cta_link`
- `email_type`

## Inference rules
If optional fields are missing:
- `campaign_goal`: infer from `email_type`
- `audience_segment`: default `interested leads`
- `brand_voice`: map by `email_type`
- `max_words`: default 180 for promo/welcome, 260 newsletter, 160 transactional, 190 reengagement
