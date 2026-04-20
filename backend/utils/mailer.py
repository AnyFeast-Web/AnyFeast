import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from typing import Dict, Any, List
from models.mealplan import MacroMeal

# Email template
EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .message { background: #f8f9fa; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
        .meal-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .meal-table th, .meal-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .meal-table th { background-color: #f2f2f2; font-weight: bold; }
        .guidelines { background: #f8f9fa; padding: 15px; margin: 20px 0; white-space: pre-wrap; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .nutrition { font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AnyFeast</h1>
        <p>Your Personalized Nutrition Plan</p>
    </div>

    <div class="content">
        <div class="greeting">
            Dear {{ client_name }},
        </div>

        <div class="message">
            {{ message }}
        </div>

        <h2>Daily Meal Plan</h2>
        <table class="meal-table">
            <thead>
                <tr>
                    <th>Meal Type</th>
                    <th>Menu</th>
                    <th>Serving</th>
                    <th>Nutrition</th>
                    <th>Prep/Cook</th>
                </tr>
            </thead>
            <tbody>
                {% for day, meals in meal_plan.items() %}
                    {% for meal_type, meal_list in meals.items() %}
                        {% if meal_list %}
                            {% for meal in meal_list %}
                            <tr>
                                <td>{{ meal_type }}</td>
                                <td>{{ meal.name or '-' }}</td>
                                <td>{{ meal.servingSize or '-' }}</td>
                                <td class="nutrition">
                                    {% if meal.calories %}{{ meal.calories }} cal{% endif %}
                                    {% if meal.protein_g %}, {{ meal.protein_g }}g P{% endif %}
                                    {% if meal.carbs_g %}, {{ meal.carbs_g }}g C{% endif %}
                                    {% if meal.fat_g %}, {{ meal.fat_g }}g F{% endif %}
                                    {% if not (meal.calories or meal.protein_g or meal.carbs_g or meal.fat_g) %}-{% endif %}
                                </td>
                                <td>
                                    {{ meal.prepTime or '-' }} / {{ meal.cookTime or '-' }}
                                    {% if meal.prepTips %}
                                    <br><small>Notes: {{ meal.prepTips }}</small>
                                    {% endif %}
                                    {% if meal.alternatives %}
                                    <br><small>Alt: {{ meal.alternatives }}</small>
                                    {% endif %}
                                </td>
                            </tr>
                            {% endfor %}
                        {% endif %}
                    {% endfor %}
                {% endfor %}
            </tbody>
        </table>

        {% if guidelines %}
        <h2>Dietary Guidelines</h2>
        <div class="guidelines">{{ guidelines }}</div>
        {% endif %}
    </div>

    <div class="footer">
        <p>This meal plan was created specifically for you by your nutritionist.</p>
        <p>For questions or concerns, please contact your healthcare provider.</p>
        <p>&copy; 2024 AnyFeast. All rights reserved.</p>
    </div>
</body>
</html>
"""

async def send_meal_plan_email(to_email: str, client_name: str, meal_plan: Dict[str, Any], message: str):
    """
    Send meal plan email asynchronously using SMTP.

    Args:
        to_email: Recipient email address
        client_name: Client's name for personalization
        meal_plan: Meal plan data with grid, preferences, and guidelines
        message: Custom message from nutritionist
    """
    smtp_email = os.environ.get("SMTP_EMAIL")
    smtp_app_password = os.environ.get("SMTP_APP_PASSWORD")
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))

    if not smtp_email or not smtp_app_password:
        raise ValueError("SMTP credentials not configured. Please set SMTP_EMAIL and SMTP_APP_PASSWORD environment variables.")

    # Prepare email content
    template = Template(EMAIL_TEMPLATE)
    html_content = template.render(
        client_name=client_name,
        message=message,
        meal_plan=meal_plan.get("grid", {}),
        guidelines=meal_plan.get("guidelines", "")
    )

    # Create message
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg['Subject'] = f"Your Personalized Meal Plan - {meal_plan.get('title', 'AnyFeast')}"

    msg.attach(MIMEText(html_content, 'html'))

    # Send email
    try:
        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_email,
            password=smtp_app_password,
            use_tls=True
        )
        return True
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")