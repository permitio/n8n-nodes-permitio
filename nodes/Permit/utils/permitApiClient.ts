// utils/permitApiClient.ts

import { IExecuteFunctions } from 'n8n-workflow';

export class PermitApiClient {
	constructor(
		private executeFunctions: IExecuteFunctions,
		private pdpUrl: string,
	) {}

	async makeRequest(endpoint: string, body: any): Promise<any> {
		return await this.executeFunctions.helpers.httpRequestWithAuthentication.call(
			this.executeFunctions,
			'permitApi',
			{
				method: 'POST',
				baseURL: this.pdpUrl,
				url: endpoint,
				body,
				json: true,
			},
		);
	}

	async checkPermission(
		user: string,
		action: string,
		resource: string,
		tenant: string = 'default',
		resourceAttributes: any = {},
		enableAbac?: boolean,
		resourceKey?: string,
	): Promise<any> {
		const requestBody: any = {
			user: { key: user },
			action: action,
			resource: {
				type: resource,
				tenant: tenant,
				...(resourceKey && { key: resourceKey }),
				...(enableAbac &&
					Object.keys(resourceAttributes).length > 0 && { attributes: resourceAttributes }),
			},
		};

		return this.makeRequest('/allowed', requestBody);
	}

	async getUserPermissions(
		user: string,
		resourceTypes?: string[],
		enableAbac?: boolean,
	): Promise<any> {
		const requestBody: any = {
			user: { key: user },
		};

		if (resourceTypes && resourceTypes.length > 0) {
			requestBody.resource_types = resourceTypes;
		}

		if (enableAbac) {
			requestBody.context = { enable_abac_user_permissions: true };
		}

		return this.makeRequest('/user-permissions', requestBody);
	}

	async getAuthorizedUsers(
		action: string,
		resourceType: string,
		tenant: string = 'default',
		resourceAttributes: any = {},
		enableAbac?: boolean,
	): Promise<any> {
		const requestBody: any = {
			action: action,
			resource: {
				type: resourceType,
				tenant: tenant,
				attributes: resourceAttributes,
			},
		};

		if (enableAbac) {
			requestBody.context = { enable_abac_authorized_users: true };
		}

		return this.makeRequest('/authorized_users', requestBody);
	}
}
