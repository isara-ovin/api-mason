export interface EnvironmentVariable {
    key: string;
    value: string;
    enabled: boolean;
    type?: string;
}

export function parsePostmanEnvironment(json: string) {
    const envJson = JSON.parse(json);

    // Postman Env v2.1 usually has 'values' array
    const values = envJson.values || [];

    return {
        id: envJson.id || envJson._postman_exported_at || Math.random().toString(36).substr(2, 9),
        name: envJson.name,
        variables: values.map((v: any) => ({
            key: v.key,
            value: v.value,
            enabled: v.enabled !== false,
            type: v.type || 'text'
        })) as EnvironmentVariable[]
    };
}
