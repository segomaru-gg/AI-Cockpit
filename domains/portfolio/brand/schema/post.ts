export default {
    name: 'post',
    title: 'Journal 記事',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'タイトル',
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
            name: 'publishedAt',
            title: '公開日',
            type: 'datetime',
            initialValue: (new Date()).toISOString(),
        },
        {
            name: 'excerpt',
            title: '抜粋',
            type: 'text',
            rows: 3,
        },
        {
            name: 'mainImage',
            title: 'メイン画像',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'body',
            title: '本文',
            type: 'array',
            of: [
                { type: 'block' },
                { type: 'image' }
            ],
        },
    ],
};
