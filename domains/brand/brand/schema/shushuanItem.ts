export default {
    name: 'shushuanItem',
    title: '蒐集庵アイテム',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: '名称',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'slug',
            title: 'スラグ',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'category',
            title: 'カテゴリ',
            type: 'string',
            options: {
                list: [
                    { title: '古物', value: 'Antique' },
                    { title: '音楽', value: 'Music' },
                    { title: '言葉', value: 'Word' },
                    { title: '記憶', value: 'Memory' },
                    { title: '思想', value: 'Ideology' },
                    { title: '空間', value: 'Space' },
                    { title: '体験', value: 'Experience' },
                ],
            },
        },
        {
            name: 'era',
            title: '時代・背景',
            type: 'string',
        },
        {
            name: 'story',
            title: '物語 (意味)',
            type: 'text',
            rows: 5,
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
            name: 'tags',
            title: 'タグ',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                layout: 'tags',
            },
        },
        {
            name: 'status',
            title: '販売ステータス',
            type: 'string',
            options: {
                list: [
                    { title: 'Available', value: 'Available' },
                    { title: 'Reserved', value: 'Reserved' },
                    { title: 'Sold Out', value: 'Sold Out' },
                    { title: 'Archived', value: 'Archived' },
                ],
            },
            initialValue: 'Available',
        },
        {
            name: 'price',
            title: '価格 (JPY)',
            type: 'number',
        },
    ],
};
