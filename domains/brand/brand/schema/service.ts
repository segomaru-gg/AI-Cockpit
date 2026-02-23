export default {
    name: 'service',
    title: 'NEXUS サービス',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'サービス名',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'slug',
            title: 'スラグ',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'description',
            title: '説明 (意味・構造)',
            type: 'text',
            rows: 5,
        },
        {
            name: 'icon',
            title: 'アイコン',
            type: 'string',
            description: 'Lucideアイコン名など',
        },
        {
            name: 'order',
            title: '表示順',
            type: 'number',
        }
    ],
};
