import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { PermitApiClient } from './utils/permitApiClient';

export class Permit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Permit',
		name: 'permit',
		icon: { light: 'file:permit.svg', dark: 'file:permit.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Permit.io authorization service',
		defaults: {
			name: 'Permit',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'permitApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Check',
						value: 'check',
						description: 'Check if user has permission',
						action: 'Check permission',
					},
					{
						name: 'Get User Permissions',
						value: 'getUserPermissions',
						description: 'Get all permissions for a user',
						action: 'Get user permissions',
					},
					{
						name: 'Get Authorized Users',
						value: 'getAuthorizedUsers',
						description: 'Get users authorized for an action',
						action: 'Get authorized users',
					},
				],
				default: 'check',
			},
			// Parameters for Check operation
			{
				displayName: 'User',
				name: 'user',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['check'],
					},
				},
				default: '',
				description: 'User identifier',
				required: true,
			},
			{
				displayName: 'Action',
				name: 'action',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['check'],
					},
				},
				default: '',
				description: 'Action to check',
				required: true,
			},
			{
				displayName: 'Tenant',
				name: 'tenant',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['check'],
					},
				},
				default: 'default',
				description: 'The tenant (defaults to "default")',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['check'],
					},
				},
				default: '',
				description: 'Resource to check access to',
				required: true,
			},
			{
				displayName: 'Enable ABAC',
				name: 'enableAbacCheck',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['check'],
					},
				},
				default: false,
				description: 'Whether to enable ABAC with auto-extracted attributes',
			},
			// parameters for Get User Permissions operation
			{
				displayName: 'User',
				name: 'userPermissionsUser',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getUserPermissions'],
					},
				},
				default: '',
				required: true,
				placeholder: 'user@example.com',
				description: 'The user key to get permissions for',
			},
			{
				displayName: 'Resource Types',
				name: 'resourceTypes',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getUserPermissions'],
					},
				},
				default: '',
				required: true,
				placeholder: 'document,__tenant',
				description: 'Comma-separated list of resource types to filter by (optional)',
			},
			{
				displayName: 'Enable ABAC',
				name: 'enableAbac',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['getUserPermissions'],
					},
				},
				default: false,
				description: 'Whether to enable ABAC user permissions',
			},

			// Get Authorized Users fields
			{
				displayName: 'Action',
				name: 'authorizedUsersAction',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getAuthorizedUsers'],
					},
				},
				default: '',
				required: true,
				placeholder: 'read',
				description: 'The action to check authorization for',
			},
			{
				displayName: 'Resource Type',
				name: 'authorizedUsersResourceType',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getAuthorizedUsers'],
					},
				},
				default: '',
				required: true,
				placeholder: 'document',
				description: 'The type of resource',
			},
			{
				displayName: 'Tenant',
				name: 'authorizedUsersTenant',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getAuthorizedUsers'],
					},
				},
				default: 'default',
				description: 'The tenant (defaults to "default")',
			},
			{
				displayName: 'Resource Attributes (JSON)',
				name: 'resourceAttributes',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['getAuthorizedUsers'],
					},
				},
				default: '{}',
				required: true,
				description: 'Resource attributes as JSON object',
			},
			{
				displayName: 'Enable ABAC',
				name: 'enableAbacUsers',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['getAuthorizedUsers'],
					},
				},
				default: false,
				description: 'Whether to enable ABAC user permissions',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('permitApi');
		const pdpUrl = (credentials.pdpUrl as string).trim();
		const permitClient = new PermitApiClient(this, pdpUrl);

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData;

				if (operation === 'check') {
					const user = this.getNodeParameter('user', i) as string;
					const action = this.getNodeParameter('action', i) as string;
					const resource = this.getNodeParameter('resource', i) as string;
					const tenant = (this.getNodeParameter('tenant', i) as string) || 'default';
					const enableAbac = this.getNodeParameter('enableAbacCheck', i) as boolean;
					const resourceAttributes = enableAbac ? items[i].json.body : {};

					responseData = await permitClient.checkPermission(
						user,
						action,
						resource,
						tenant,
						resourceAttributes,
						enableAbac,
					);
				} else if (operation === 'getUserPermissions') {
					const user = this.getNodeParameter('userPermissionsUser', i) as string;
					const resourceTypes = this.getNodeParameter('resourceTypes', i) as string;
					const enableAbac = this.getNodeParameter('enableAbac', i) as boolean;

					const resourceTypesArray = resourceTypes
						? resourceTypes.split(',').map((type) => type.trim())
						: undefined;

					responseData = await permitClient.getUserPermissions(
						user,
						resourceTypesArray,
						enableAbac,
					);
				} else if (operation === 'getAuthorizedUsers') {
					const action = this.getNodeParameter('authorizedUsersAction', i) as string;
					const resourceType = this.getNodeParameter('authorizedUsersResourceType', i) as string;
					const tenant = this.getNodeParameter('authorizedUsersTenant', i) as string;
					const resourceAttributes = this.getNodeParameter('resourceAttributes', i);
					const enableAbac = this.getNodeParameter('enableAbacUsers', i) as boolean;

					const parsedAttributes =
						typeof resourceAttributes === 'string'
							? JSON.parse(resourceAttributes)
							: resourceAttributes;

					responseData = await permitClient.getAuthorizedUsers(
						action,
						resourceType,
						tenant,
						parsedAttributes,
						enableAbac,
					);
				}

				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}
