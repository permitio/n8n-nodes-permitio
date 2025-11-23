![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-permitio

An n8n community node for integrating with [Permit.io](https://permit.io) authorization service.
Permit is a fullstack, plug-and-play application-level authorization solution. This node allows you to check permissions, retrieve user permissions, and get authorized users directly within your n8n workflows.

![ABAC Expense Approval System](/assets/permit-n8n-workflow.png)

## Features

- **Check Permissions**: Verify if a user has permission to perform a specific action on a resource
- **Get User Permissions**: Retrieve all permissions for a specific user across tenants and resources
- **Get Authorized Users**: Find all users authorized to perform a specific action on a resource type

## Installation

**Install via n8n UI:**

1. In your n8n workflow editor, click the "+" to add a new node
2. Search for "Permit" in the node search box
3. Click on the Permit node in the search results
4. Click "Install node" button in the Node details panel
5. Wait for installation to complete
6. The Permit node will now be available in your workflow

**Package name:** `@permitio/n8n-nodes-permitio`
![Installation Guide](./assets/permit-n8n-installation.gif)

For alternative installation methods, follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

To use this node, you need to set up Permit.io API credentials in n8n.

**Prerequisites:**

- A [Permit.io account](https://app.permit.io)
- Your Permit.io API key

**Setting up credentials:**

1. In n8n, go to the **Overview** tab in the left sidebar
2. Click on the **Credentials** tab
3. Click **"Add first credential"** (or **"Create credential"** if you have existing credentials)
4. Search for **"Permit"** and select **"Permit API"**
5. Fill in the required fields:
   - **API Key**: Your Permit.io API key (found in Permit.io dashboard under Settings → API Keys)
   - **PDP URL**: `https://cloudpdp.api.permit.io` (default for cloud PDP)

**For ABAC and ReBAC policies:**

- **Local PDP**: If running a self-hosted PDP container, you'll need to expose it publicly (e.g., using ngrok) and use that public URL
- Example: `https://abc123.ngrok.io` instead of `http://localhost:7766`
- This provides better performance and supports advanced policy types

**Getting your API key:**

1. Log into your [Permit.io dashboard](https://app.permit.io)
2. Go to Settings → API Keys
3. Copy your API key and paste it into the n8n credential configuration

![Credentials Workflow](/assets/credentials-workflow.gif)

**Note:** Keep your API key secure and never share it publicly.

## Operations

**Check**

- Check if a user has permission to perform an action on a resource
- Supports RBAC, ABAC, and ReBAC policies with automatic attribute extraction
- Returns boolean permission result with detailed debug information

_Configuration:_

- **User:** `{{$node['Webhook'].json.body.employee_email}}`
- **Action:** `submit`
- **Resource:** `expense`
- **Enable ABAC:** ✅ (automatically extracts `expense_amount`, `category`, etc.)

_Response Sample:_

```json
{
	"allow": true,
	"decision": "2024-01-15T10:30:00Z",
	"debug": {
		"reason": "User john.employee can submit expense within $2000 limit"
	}
}
```

**Get User Permissions**

- Get all permissions for a specific user
- Filter by resource types
- Optional ABAC support for dynamic permissions

_Configuration:_

- **User:** `john.employee`
- **Resource Types:** `expense,document`
- **Enable ABAC:** ✅

_Response Sample:_

```json
{
	"permissions": [
		{
			"resource": "expense",
			"action": "submit",
			"allowed": true
		}
	]
}
```

**Get Authorized Users**

- Find all users who can perform a specific action on a resource
- Useful for approval workflows and delegation
- Returns list of authorized users with their roles and permissions

_Configuration:_

- **Action:** `approve`
- **Resource Type:** `expense`
- **Resource Attributes:** `{"expense_amount": 1500, "category": "Travel"}`
- **Enable ABAC:** ✅

_Response Sample:_

```json
[
	{
		"resource": "expense:*",
		"tenant": "default",
		"users": {
			"taofeek2sure@gmail.com": [
				{
					"user": "taofeek2sure@gmail.com",
					"tenant": "default",
					"resource": "resourceset_all_5fexpenses",
					"role": "userset_finance_5fteam"
				}
			]
		}
	}
]
```

## Basic Usage Example

![ABAC Expense Example](/assets/abac-expense-example.png)

This example shows how to build an ABAC-powered expense approval workflow using the Permit node.

**Scenario:** Employees submit expenses for approval. The system automatically determines if they can submit based on their spending limits, then routes to authorized approvers.

**Workflow:**

1. **Webhook** receives expense submission (`employee_email`, `expense_amount`, `category`)
2. **Check Permission** with ABAC enabled - automatically extracts expense attributes
3. **IF node** branches on approval/denial
4. **TRUE path:** Get Authorized Users → Send Email to approver
5. **FALSE path:** Return 403 error response

**Result:**

- Employee submitting $1500 (within $2000 limit) → Email sent to finance approver
- Employee submitting $2500 (exceeds limit) → Access denied with detailed error

This demonstrates how the Permit node enables complex authorization workflows with minimal configuration.

## Compatibility

- **Minimum n8n version**: 1.0+
- **Node.js**: 20.15+ required
- **Tested with**: n8n 1.111.0

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Permit.io Documentation](https://docs.permit.io/)
- [Permit.io API Reference](https://api.permit.io/v2/redoc)
- [Getting Started with Permit.io](https://docs.permit.io/quickstart/)

**Authorization Models:**

- [ABAC Guide - Building Your First ABAC Policy](https://docs.permit.io/how-to/build-policies/abac/building-abac-policy/)
- [ReBAC Guide - What is ReBAC?](https://docs.permit.io/how-to/build-policies/rebac/overview/)
- [Create a ReBAC Policy](https://docs.permit.io/overview/create-a-rebac-policy/)

**Infrastructure & Deployment:**

- [Terraform Provider Guide](https://docs.permit.io/integrations/infra-as-code/terraform-provider/)
- [Self-Deployed PDP for ABAC/ReBAC](https://docs.permit.io/concepts/pdp/overview/)
- [Running Local PDP Container](https://docs.permit.io/overview/connecting-your-app/)

**API Methods:**

- [Permit.check() - Permission Checking](https://docs.permit.io/how-to/enforce-permissions/check/)
- [Get User Permissions API](https://docs.permit.io/how-to/enforce-permissions/user-permissions/)
- [Get Authorized Users API](https://docs.permit.io/how-to/enforce-permissions/authorized-users/)

## License

[MIT](LICENSE.md)

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

---

Built with ❤️ for the n8n community
