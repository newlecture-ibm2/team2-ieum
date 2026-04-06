#!/usr/bin/env node
// ERD → .drawio XML 생성 스크립트
const fs = require('fs');

const W = 300, RH = 26, HS = 30;
const colors = {
  core: { fill: '#dae8fc', stroke: '#6c8ebf' },
  relation: { fill: '#d5e8d4', stroke: '#82b366' },
  support: { fill: '#fff2cc', stroke: '#d6b656' },
};

const tables = [
  { id: 100, name: 'users', label: '회원', type: 'core', x: 780, y: 40, w: W, cols: [
    { n: 'user_id', t: 'bigint', k: 'pk' }, { n: 'email', t: 'varchar(100)', k: 'uk' },
    { n: 'password', t: 'varchar(255)' }, { n: 'nickname', t: 'varchar(20)', k: 'uk' },
    { n: 'phone', t: 'varchar(20)' }, { n: 'profile_image', t: 'varchar(500)' },
    { n: 'role', t: 'varchar(10)' }, { n: 'is_active', t: 'boolean' },
    { n: 'created_at', t: 'timestamp' }, { n: 'updated_at', t: 'timestamp' },
  ]},
  { id: 200, name: 'festivals', label: '축제', type: 'core', x: 380, y: 40, w: 340, cols: [
    { n: 'festival_id', t: 'bigint', k: 'pk' }, { n: 'source_id', t: 'varchar(20)', k: 'uk' },
    { n: 'source', t: 'varchar(10)' }, { n: 'title', t: 'varchar(200)' },
    { n: 'description', t: 'text' }, { n: 'overview', t: 'text' },
    { n: 'address', t: 'varchar(300)' }, { n: 'start_date', t: 'date' },
    { n: 'end_date', t: 'date' }, { n: 'status', t: 'varchar(10)' },
    { n: 'image_url', t: 'varchar(500)' }, { n: 'latitude', t: 'decimal(10,7)' },
    { n: 'longitude', t: 'decimal(10,7)' }, { n: 'tel', t: 'varchar(50)' },
    { n: 'homepage', t: 'varchar(500)' }, { n: 'category', t: 'varchar(10)', k: 'fk' },
    { n: 'category_mid', t: 'varchar(10)' }, { n: 'category_sub', t: 'varchar(10)' },
    { n: 'area_code', t: 'varchar(10)', k: 'fk' }, { n: 'sigungu_code', t: 'varchar(5)', k: 'fk' },
    { n: 'ldong_code', t: 'varchar(20)' }, { n: 'event_place', t: 'varchar(200)' },
    { n: 'play_time', t: 'varchar(200)' }, { n: 'program', t: 'text' },
    { n: 'use_fee', t: 'varchar(200)' }, { n: 'sponsor', t: 'varchar(100)' },
    { n: 'is_custom', t: 'boolean' }, { n: 'is_visible', t: 'boolean' },
    { n: 'view_count', t: 'int' }, { n: 'api_modified_at', t: 'timestamp' },
    { n: 'created_at', t: 'timestamp' }, { n: 'updated_at', t: 'timestamp' },
  ]},
  { id: 300, name: 'reviews', label: '리뷰', type: 'core', x: 780, y: 370, w: W, cols: [
    { n: 'review_id', t: 'bigint', k: 'pk' }, { n: 'festival_id', t: 'bigint', k: 'fk' },
    { n: 'user_id', t: 'bigint', k: 'fk' }, { n: 'rating', t: 'int' },
    { n: 'content', t: 'varchar(500)' }, { n: 'created_at', t: 'timestamp' },
    { n: 'updated_at', t: 'timestamp' },
  ]},
  { id: 400, name: 'scraps', label: '찜하기', type: 'relation', x: 780, y: 620, w: W, cols: [
    { n: 'scrap_id', t: 'bigint', k: 'pk' }, { n: 'user_id', t: 'bigint', k: 'fk' },
    { n: 'festival_id', t: 'bigint', k: 'fk' }, { n: 'created_at', t: 'timestamp' },
  ]},
  { id: 500, name: 'posts', label: '게시글', type: 'core', x: 1160, y: 40, w: W, cols: [
    { n: 'post_id', t: 'bigint', k: 'pk' }, { n: 'user_id', t: 'bigint', k: 'fk' },
    { n: 'category_id', t: 'bigint', k: 'fk' }, { n: 'title', t: 'varchar(100)' },
    { n: 'content', t: 'text' }, { n: 'view_count', t: 'int' },
    { n: 'like_count', t: 'int' }, { n: 'comment_count', t: 'int' },
    { n: 'created_at', t: 'timestamp' }, { n: 'updated_at', t: 'timestamp' },
  ]},
  { id: 600, name: 'comments', label: '댓글', type: 'core', x: 1540, y: 40, w: W, cols: [
    { n: 'comment_id', t: 'bigint', k: 'pk' }, { n: 'post_id', t: 'bigint', k: 'fk' },
    { n: 'user_id', t: 'bigint', k: 'fk' }, { n: 'parent_id', t: 'bigint', k: 'fk' },
    { n: 'content', t: 'text' }, { n: 'created_at', t: 'timestamp' },
    { n: 'updated_at', t: 'timestamp' },
  ]},
  { id: 700, name: 'post_likes', label: '게시글 좋아요', type: 'relation', x: 1160, y: 370, w: W, cols: [
    { n: 'like_id', t: 'bigint', k: 'pk' }, { n: 'post_id', t: 'bigint', k: 'fk' },
    { n: 'user_id', t: 'bigint', k: 'fk' }, { n: 'created_at', t: 'timestamp' },
  ]},
  { id: 800, name: 'attachments', label: '첨부파일', type: 'support', x: 40, y: 40, w: W, cols: [
    { n: 'file_id', t: 'bigint', k: 'pk' }, { n: 'target_type', t: 'varchar(10)' },
    { n: 'target_id', t: 'bigint' }, { n: 'original_name', t: 'varchar(255)' },
    { n: 'stored_name', t: 'varchar(255)' }, { n: 'file_url', t: 'varchar(500)' },
    { n: 'file_size', t: 'bigint' }, { n: 'created_at', t: 'timestamp' },
  ]},
  { id: 900, name: 'notices', label: '공지사항', type: 'support', x: 40, y: 310, w: W, cols: [
    { n: 'notice_id', t: 'bigint', k: 'pk' }, { n: 'title', t: 'varchar(200)' },
    { n: 'content', t: 'text' }, { n: 'is_pinned', t: 'boolean' },
    { n: 'view_count', t: 'int' }, { n: 'start_date', t: 'timestamp' },
    { n: 'end_date', t: 'timestamp' }, { n: 'created_at', t: 'timestamp' },
    { n: 'updated_at', t: 'timestamp' },
  ]},
  { id: 1000, name: 'inquiries', label: '1:1 문의', type: 'support', x: 40, y: 560, w: W, cols: [
    { n: 'inquiry_id', t: 'bigint', k: 'pk' }, { n: 'user_id', t: 'bigint', k: 'fk' },
    { n: 'title', t: 'varchar(200)' }, { n: 'content', t: 'text' },
    { n: 'status', t: 'varchar(10)' }, { n: 'answer', t: 'text' },
    { n: 'answered_at', t: 'timestamp' }, { n: 'answered_by', t: 'bigint', k: 'fk' },
    { n: 'created_at', t: 'timestamp' },
  ]},
  { id: 1100, name: 'reports', label: '신고', type: 'support', x: 1540, y: 290, w: W, cols: [
    { n: 'report_id', t: 'bigint', k: 'pk' }, { n: 'user_id', t: 'bigint', k: 'fk' },
    { n: 'target_type', t: 'varchar(10)' }, { n: 'target_id', t: 'bigint' },
    { n: 'reason', t: 'varchar(20)' }, { n: 'description', t: 'varchar(500)' },
    { n: 'status', t: 'varchar(10)' }, { n: 'action', t: 'varchar(20)' },
    { n: 'admin_note', t: 'varchar(500)' }, { n: 'processed_at', t: 'timestamp' },
    { n: 'created_at', t: 'timestamp' },
  ]},
  { id: 1200, name: 'notifications', label: '알림', type: 'support', x: 1540, y: 660, w: W, cols: [
    { n: 'notification_id', t: 'bigint', k: 'pk' }, { n: 'user_id', t: 'bigint', k: 'fk' },
    { n: 'type', t: 'varchar(20)' }, { n: 'title', t: 'varchar(200)' },
    { n: 'message', t: 'text' }, { n: 'is_read', t: 'boolean' },
    { n: 'reference_id', t: 'bigint' }, { n: 'created_at', t: 'timestamp' },
  ]},
  { id: 1300, name: 'fcm_tokens', label: 'FCM 토큰', type: 'support', x: 780, y: 800, w: W, cols: [
    { n: 'token_id', t: 'bigint', k: 'pk' }, { n: 'user_id', t: 'bigint', k: 'fk' },
    { n: 'token', t: 'varchar(500)' }, { n: 'created_at', t: 'timestamp' },
  ]},
  { id: 1400, name: 'notification_settings', label: '알림 설정', type: 'support', x: 1160, y: 550, w: W, cols: [
    { n: 'setting_id', t: 'bigint', k: 'pk' }, { n: 'user_id', t: 'bigint', k: 'fk' },
    { n: 'festival_reminder', t: 'boolean' }, { n: 'comment_reply', t: 'boolean' },
    { n: 'report_result', t: 'boolean' }, { n: 'notice_alert', t: 'boolean' },
    { n: 'system_alert', t: 'boolean' }, { n: 'created_at', t: 'timestamp' },
  ]},
  { id: 1500, name: 'categories', label: '카테고리', type: 'support', x: 1160, y: 830, w: W, cols: [
    { n: 'category_id', t: 'bigint', k: 'pk' }, { n: 'name', t: 'varchar(50)' },
    { n: 'slug', t: 'varchar(20)', k: 'uk' },
  ]},
  { id: 1600, name: 'batch_log', label: '배치 로그', type: 'support', x: 40, y: 860, w: W, cols: [
    { n: 'id', t: 'bigserial', k: 'pk' }, { n: 'batch_id', t: 'varchar(10)' },
    { n: 'batch_name', t: 'varchar(100)' }, { n: 'trigger_type', t: 'varchar(10)' },
    { n: 'triggered_by', t: 'bigint', k: 'fk' }, { n: 'status', t: 'varchar(10)' },
    { n: 'started_at', t: 'timestamp' }, { n: 'finished_at', t: 'timestamp' },
    { n: 'execution_time', t: 'varchar(20)' }, { n: 'total_count', t: 'int' },
    { n: 'insert_count', t: 'int' }, { n: 'update_count', t: 'int' },
    { n: 'skip_count', t: 'int' }, { n: 'fail_count', t: 'int' },
    { n: 'error_message', t: 'text' }, { n: 'error_detail', t: 'text' },
    { n: 'created_at', t: 'timestamp' },
  ]},
  { id: 1700, name: 'region_master', label: '지역 마스터', type: 'support', x: 40, y: 1150, w: W, cols: [
    { n: 'region_code', t: 'varchar(20)', k: 'pk' }, { n: 'name', t: 'varchar(50)' },
    { n: 'type', t: 'varchar(20)' }, { n: 'is_active', t: 'boolean' },
    { n: 'updated_at', t: 'timestamp' },
  ]},
  { id: 1800, name: 'sigungu_master', label: '시군구 마스터', type: 'support', x: 40, y: 1350, w: W, cols: [
    { n: 'id', t: 'bigint', k: 'pk' }, { n: 'region_code', t: 'varchar(20)', k: 'fk' },
    { n: 'sigungu_code', t: 'varchar(20)' }, { n: 'name', t: 'varchar(50)' },
    { n: 'is_active', t: 'boolean' }, { n: 'updated_at', t: 'timestamp' },
  ]},
  { id: 1900, name: 'category_master', label: '카테고리 마스터', type: 'support', x: 400, y: 1150, w: W, cols: [
    { n: 'category_code', t: 'varchar(20)', k: 'pk' }, { n: 'name', t: 'varchar(50)' },
    { n: 'type', t: 'varchar(20)' }, { n: 'is_active', t: 'boolean' },
    { n: 'updated_at', t: 'timestamp' },
  ]},
];

// Relationships: [sourceTableId, sourceColIdx, targetTableId, targetColIdx, cardinality]
// colIdx is 0-based index into cols array
const edges = [
  [100, 0, 300, 2, '1:N'],   // users → reviews (user_id)
  [200, 0, 300, 1, '1:N'],   // festivals → reviews (festival_id)
  [100, 0, 400, 1, '1:N'],   // users → scraps
  [200, 0, 400, 2, '1:N'],   // festivals → scraps
  [100, 0, 500, 1, '1:N'],   // users → posts
  [100, 0, 600, 2, '1:N'],   // users → comments
  [500, 0, 600, 1, '1:N'],   // posts → comments
  [600, 0, 600, 3, '1:N'],   // comments → comments (self-ref)
  [100, 0, 700, 2, '1:N'],   // users → post_likes
  [500, 0, 700, 1, '1:N'],   // posts → post_likes
  [100, 0, 1000, 1, '1:N'],  // users → inquiries
  [100, 0, 1100, 1, '1:N'],  // users → reports
  [100, 0, 1200, 1, '1:N'],  // users → notifications
  [100, 0, 1300, 1, '1:N'],  // users → fcm_tokens
  [100, 0, 1400, 1, '1:1'],  // users → notification_settings
  [1500, 0, 500, 2, '1:N'],  // categories → posts
  [100, 0, 1600, 4, '1:N'],  // users → batch_log
  [1700, 0, 1800, 1, '1:N'], // region_master → sigungu_master
  [1700, 0, 200, 18, '1:N'], // region_master → festivals
  [1900, 0, 200, 15, '1:N'], // category_master → festivals
];

function escXml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

let cells = [];
cells.push('<mxCell id="0"/>');
cells.push('<mxCell id="1" parent="0"/>');

for (const t of tables) {
  const c = colors[t.type];
  const h = HS + t.cols.length * RH;
  const containerStyle = `swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=${HS};horizontalStack=0;resizeParent=1;resizeParentMax=0;collapsible=0;marginBottom=0;fillColor=${c.fill};strokeColor=${c.stroke};`;
  cells.push(`<mxCell id="${t.id}" value="${escXml(t.name)} (${escXml(t.label)})" style="${containerStyle}" vertex="1" parent="1"><mxGeometry x="${t.x}" y="${t.y}" width="${t.w}" height="${h}" as="geometry"/></mxCell>`);

  t.cols.forEach((col, i) => {
    const cid = t.id + i + 1;
    let prefix = '    ';
    let fs = 0;
    if (col.k === 'pk') { prefix = 'PK '; fs = 4; }
    else if (col.k === 'fk') { prefix = 'FK '; fs = 2; }
    else if (col.k === 'uk') { prefix = 'UK '; fs = 4; }
    const val = `${prefix}${col.n} : ${col.t}`;
    const colStyle = `text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=${fs};`;
    const cy = HS + i * RH;
    cells.push(`<mxCell id="${cid}" value="${escXml(val)}" style="${colStyle}" vertex="1" parent="${t.id}"><mxGeometry y="${cy}" width="${t.w}" height="${RH}" as="geometry"/></mxCell>`);
  });
}

edges.forEach((e, i) => {
  const [srcTbl, srcCol, tgtTbl, tgtCol, card] = e;
  const srcId = srcTbl + srcCol + 1;
  const tgtId = tgtTbl + tgtCol + 1;
  const endArrow = card === '1:1' ? 'ERmandOne' : 'ERmany';
  const style = `edgeStyle=entityRelationEdgeStyle;fontSize=12;html=1;endArrow=${endArrow};endFill=0;startArrow=ERmandOne;startFill=0;`;
  cells.push(`<mxCell id="${2000+i}" value="${card}" style="${style}" edge="1" source="${srcId}" target="${tgtId}" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>`);
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" type="device">
<diagram name="이음 ERD" id="ieum-erd">
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2400" pageHeight="1600">
<root>
${cells.join('\n')}
</root>
</mxGraphModel>
</diagram>
</mxfile>`;

const outPath = __dirname + '/이음_ERD.drawio';
fs.writeFileSync(outPath, xml, 'utf8');
console.log('✅ 생성 완료:', outPath);
console.log(`   테이블: ${tables.length}개`);
console.log(`   관계선: ${edges.length}개`);
console.log(`   총 셀: ${cells.length}개`);
