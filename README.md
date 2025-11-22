![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-permitio

An n8n community node for integrating with [Permit.io](https://permit.io) authorization service. This node allows you to check permissions, retrieve user permissions, and get authorized users directly within your n8n workflows.

## Features

- **Check Permissions**: Verify if a user has permission to perform a specific action on a resource
- **Get User Permissions**: Retrieve all permissions for a specific user across tenants and resources
- **Get Authorized Users**: Find all users authorized to perform a specific action on a resource type

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-permitio`
4. Select **Install**

After installation restart n8n to register the new nodes.

### Manual Installation

To get started install the package in your n8n root directory:

```bash
npm install n8n-nodes-permitio
```

For Docker-based deployments add the following line before the font installation command in your n8n Dockerfile:

```dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-permitio
```

## Credentials Configuration

Before using the Permit node, you need to configure your Permit.io credentials:

1. In n8n, go to **Credentials** and create new **Permit API** credentials
2. Fill in the required fields:
   - **API Key**: Your Permit.io API key (get it from [Permit Dashboard](https://app.permit.io))
   - **PDP URL**: Policy Decision Point URL (defaults to `https://cloudpdp.api.permit.io`)

### Getting Your API Key

1. Log in to your [Permit.io Dashboard](https://app.permit.io)
2. Navigate to the **Settings** section
3. Copy your **API Key**
4. For local development, you may need to run a local PDP instance

## Operations

### Check Permission

Verifies if a user has permission to perform a specific action on a resource.

**Parameters:**

- **User** (required): User identifier (email or user key)
- **Action** (required): Action to check (e.g., "read", "write", "delete")
- **Resource** (required): Resource type to check access to (e.g., "document", "file")
- **Tenant** (optional): Tenant identifier (defaults to "default")

**Example Response:**

```json
{
	"allow": true,
	"reason": "user 'john@example.com' has the role 'editor' in tenant 'default', role 'editor' has the 'read' permission on resources of type 'document'"
}
```

### Get User Permissions

Retrieves all permissions for a specific user across all tenants.

**Parameters:**

- **User** (required): User identifier to get permissions for
- **Resource Types** (optional): Comma-separated list of resource types to filter by (e.g., "document,folder,\_\_tenant")
- **Enable ABAC** (optional): Enable Attribute-Based Access Control for more detailed permissions

**Special Resource Types:**

- Use `__tenant` to include tenant-level permissions (admin, management permissions)
- Leave empty to get permissions for all resource types

**Example Response:**

```json
{
	"tenant1": {
		"document": {
			"doc1": ["read", "write"],
			"doc2": ["read"]
		},
		"__tenant": {
			"tenant1": ["admin"]
		}
	}
}
```

### Get Authorized Users

Finds all users authorized to perform a specific action on a resource type.

**Parameters:**

- **Action** (required): Action to check authorization for (e.g., "read", "write")
- **Resource Type** (required): Type of resource (e.g., "document", "folder")
- **Tenant** (optional): Tenant identifier (defaults to "default")
- **Resource Attributes** (optional): JSON object with resource attributes for filtering
- **Enable ABAC** (optional): Enable Attribute-Based Access Control

**Example Resource Attributes:**

```json
{
	"cost": 1000,
	"department": "engineering"
}
```

**Example Response:**

```json
[
	{
		"user": {
			"key": "john@example.com",
			"email": "john@example.com"
		},
		"role": "editor"
	},
	{
		"user": {
			"key": "jane@example.com",
			"email": "jane@example.com"
		},
		"role": "admin"
	}
]
```

## Usage Examples

### Basic Permission Check Workflow

1. Add a **Manual Trigger** node
2. Add the **Permit** node and select **Check** operation
3. Configure:
   - **User**: `john@example.com`
   - **Action**: `read`
   - **Resource**: `document`
   - **Tenant**: `default`
4. Add an **IF** node to handle the permission result based on the `allow` field

### User Permissions Audit

1. Use **Get User Permissions** operation
2. Set **Resource Types** to `document,folder,__tenant` to get comprehensive permissions
3. Process the response to create permission reports or dashboards

## Support

- [Permit.io Documentation](https://docs.permit.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [GitHub Issues](https://github.com/permitio/n8n-nodes-permitio/issues)

## License

[MIT](LICENSE.md)

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

---

Built with ❤️ for the n8n community
