import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PermitApi implements ICredentialType {
	name = 'permitApi';
	displayName = 'Permit API';
	documentationUrl = 'https://docs.permit.io/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'PDP URL',
			name: 'pdpUrl',
			type: 'string',
			default: 'https://cloudpdp.api.permit.io',
			description: 'Policy Decision Point URL',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.pdpUrl}}',
			url: '/allowed',
			method: 'POST',
			body: {
				user: {
					key: 'test-user',
				},
				action: 'read',
				resource: {
					type: 'test-resource',
				},
			},
		},
	};
}
