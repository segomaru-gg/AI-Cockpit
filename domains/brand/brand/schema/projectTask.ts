export default {
  name: 'projectTask',
  title: 'Project Task (Blueprint)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'タスク名',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'phase',
      title: 'フェーズ',
      type: 'number',
      options: {
        list: [
          { title: 'Phase 1: 技術基盤の構築', value: 1 },
          { title: 'Phase 2: デザイン & コンテンツ統合', value: 2 },
          { title: 'Phase 3: テスト & リリース', value: 3 },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'status',
      title: 'ステータス',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'In Progress', value: 'doing' },
          { title: 'Completed', value: 'done' },
        ],
      },
      initialValue: 'pending',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: '詳細・ログ',
      type: 'text',
      rows: 3,
    },
    {
      name: 'order',
      title: '表示順',
      type: 'number',
    },
    {
      name: 'completedAt',
      title: '完了日',
      type: 'datetime',
    },
  ],
  orderings: [
    {
      title: 'Phase & Order',
      name: 'phaseOrderAsc',
      by: [
        { field: 'phase', direction: 'asc' },
        { field: 'order', direction: 'asc' }
      ]
    }
  ]
};
