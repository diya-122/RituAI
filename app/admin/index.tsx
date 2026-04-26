import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLG, Stop, Line, Rect } from 'react-native-svg';

import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors, Gradients, Typography, Radius, Shadows } from '@/theme';
import { useStore } from '@/store/useStore';

const { width: W } = Dimensions.get('window');
const PAD = 20;
type Tab = 'overview' | 'users' | 'content' | 'ai' | 'compliance';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'overview', label: 'Overview', emoji: '📊' },
  { id: 'users', label: 'Users', emoji: '👥' },
  { id: 'content', label: 'Content', emoji: '📝' },
  { id: 'ai', label: 'AI Ops', emoji: '🧠' },
  { id: 'compliance', label: 'Compliance', emoji: '🔒' },
];

export default function Admin() {
  const router = useRouter();
  const logout = useStore((s) => s.logout);
  const [tab, setTab] = useState<Tab>('overview');

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={Gradients.lotus as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.badge}>
              <Text style={s.badgeText}>ADMIN</Text>
            </View>
            <Text style={s.heading} numberOfLines={1}>Operations</Text>
          </View>
          <View style={s.headerBtns}>
            <Pressable onPress={() => router.back()} style={s.headerBtn}>
              <Text style={s.headerBtnText}>← Back</Text>
            </Pressable>
            <Pressable onPress={handleLogout} style={[s.headerBtn, { backgroundColor: Colors.danger }]}>
              <Text style={[s.headerBtnText, { color: '#fff' }]}>Logout</Text>
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabRow}
          bounces={false}
          overScrollMode="never"
        >
          {TABS.map((t) => (
            <Pressable
              key={t.id}
              style={[s.tab, tab === t.id && s.tabActive]}
              onPress={() => setTab(t.id)}
            >
              <Text style={{ fontSize: 14, marginRight: 5 }}>{t.emoji}</Text>
              <Text
                style={[s.tabLabel, tab === t.id && s.tabLabelActive]}
                numberOfLines={1}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: PAD }} showsVerticalScrollIndicator={false}>
          {tab === 'overview' && <OverviewTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'content' && <ContentTab />}
          {tab === 'ai' && <AITab />}
          {tab === 'compliance' && <ComplianceTab />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ---- Stat Card ---- */
function StatCard({ label, value, delta, emoji }: any) {
  const display = typeof value === 'number' ? value.toLocaleString() : value;
  return (
    <View style={s.statCard}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={s.statValue}>{display}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {delta && <Text style={[s.statDelta, delta.startsWith('-') && { color: Colors.danger }]}>{delta}</Text>}
    </View>
  );
}

/* ---- Overview ---- */
function OverviewTab() {
  const stats = [
    { label: 'Total users', value: 12847, delta: '+4.2%', emoji: '👥' },
    { label: 'Daily active', value: 3421, delta: '+1.8%', emoji: '🌿' },
    { label: 'Scans today', value: 1289, delta: '+12.4%', emoji: '📸' },
    { label: 'Saheli chats', value: 4502, delta: '+8.1%', emoji: '💬' },
  ];

  return (
    <>
      <View style={s.statsGrid}>
        {stats.map((st, i) => <StatCard key={i} {...st} />)}
      </View>

      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Daily active users · last 14 days</Text>
        <DAUChart />
      </GlassCard>

      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Risk score distribution</Text>
        <Text style={s.cardSub}>Across all users with 3+ cycles logged</Text>
        <RiskHistogram />
      </GlassCard>

      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Geographic spread · India</Text>
        {[
          ['Maharashtra', 3284], ['Karnataka', 2147], ['Tamil Nadu', 1892],
          ['Delhi NCR', 1649], ['Gujarat', 1156], ['West Bengal', 892],
        ].map(([state, n]) => (
          <View key={state as string} style={s.barRow}>
            <Text style={s.barLabel}>{state}</Text>
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${((n as number) / 3284) * 100}%` }]} />
            </View>
            <Text style={s.barValue}>{(n as number).toLocaleString()}</Text>
          </View>
        ))}
      </GlassCard>
    </>
  );
}

function DAUChart() {
  const data = [2100,2400,2350,2600,2750,2900,3100,2950,3200,3350,3250,3400,3380,3421];
  const max = Math.max(...data);
  const w = W - 2 * PAD - 40;
  const h = 120;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  const pathD = `M ${points.split(' ').join(' L ')}`;
  const fillD = `${pathD} L ${w},${h} L 0,${h} Z`;

  return (
    <View style={{ marginTop: 14 }}>
      <Svg width={w} height={h + 16}>
        <Defs>
          <SvgLG id="cf" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.templeMaroon} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={Colors.templeMaroon} stopOpacity={0.03} />
          </SvgLG>
        </Defs>
        <Path d={fillD} fill="url(#cf)" />
        <Path d={pathD} stroke={Colors.templeMaroon} strokeWidth={2} fill="none" />
        {data.map((v, i) => (
          <Circle key={i} cx={i * step} cy={h - (v / max) * h}
            r={i === data.length - 1 ? 5 : 2}
            fill={i === data.length - 1 ? Colors.saffronGold : Colors.templeMaroon}
          />
        ))}
      </Svg>
    </View>
  );
}

function RiskHistogram() {
  const buckets = [
    { range: '0-20', count: 1240, zone: 'low' },
    { range: '20-40', count: 2890, zone: 'low' },
    { range: '40-60', count: 3420, zone: 'mid' },
    { range: '60-80', count: 2180, zone: 'high' },
    { range: '80-100', count: 890, zone: 'high' },
  ];
  const max = Math.max(...buckets.map((b) => b.count));

  return (
    <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 140 }}>
      {buckets.map((b, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <View style={[s.histBar, {
            height: (b.count / max) * 110,
            backgroundColor: b.zone === 'low' ? Colors.emeraldBreath : b.zone === 'mid' ? Colors.saffronGold : Colors.danger,
          }]} />
          <Text style={s.histLabel}>{b.range}</Text>
          <Text style={s.histCount}>{b.count.toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---- Users ---- */
function UsersTab() {
  const users = Array.from({ length: 10 }).map((_, i) => ({
    id: `U-${1000 + i}`,
    initials: ['RS','PK','SM','AJ','DC','NR'][i%6],
    lastActive: ['2h','5h','1d','3d','6h','1h'][i%6],
    cycles: Math.floor(Math.random()*20)+3,
    risk: Math.floor(Math.random()*100),
    flagged: Math.random()>0.7,
  }));

  return (
    <>
      <GlassCard style={[s.card, { padding: 12 }]}>
        <View style={s.searchBar}>
          <Text style={{ color: Colors.textMuted, fontSize: 14 }}>🔍  Search users…</Text>
        </View>
        <View style={s.filterRow}>
          {['All','PCOS flagged','Irregular','High risk','New'].map((f) => (
            <View key={f} style={s.filterChip}>
              <Text style={s.filterChipText}>{f}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
      <GlassCard style={s.card}>
        {users.map((u) => (
          <View key={u.id} style={s.userRow}>
            <View style={s.userAvatar}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>{u.initials}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{u.id}</Text>
              <Text style={s.userMeta}>Active {u.lastActive} · {u.cycles} cycles</Text>
            </View>
            <View style={s.riskChip}>
              <View style={[s.riskDot, { backgroundColor: u.risk<35 ? Colors.emeraldBreath : u.risk<70 ? Colors.saffronGold : Colors.danger }]} />
              <Text style={s.riskText}>{u.risk}</Text>
            </View>
            {u.flagged && <Text style={{ marginLeft: 6 }}>🚩</Text>}
          </View>
        ))}
      </GlassCard>
    </>
  );
}

/* ---- Content ---- */
function ContentTab() {
  const content = [
    { phase: 'Menstrual', type: 'Diet', title: 'Warming dal with ghee', status: 'Live', locale: 'EN · HI' },
    { phase: 'Follicular', type: 'Workout', title: 'Strength + cardio session', status: 'Draft', locale: 'EN' },
    { phase: 'Ovulatory', type: 'Diet', title: 'Magnesium-rich ragi roti', status: 'Live', locale: 'EN · HI' },
    { phase: 'Luteal', type: 'Stress', title: '4-7-8 breathwork', status: 'Live', locale: 'EN · HI · MR' },
  ];

  return (
    <>
      <GlassCard style={s.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.cardTitle}>Recommendation library</Text>
          <View style={s.addBtn}><Text style={s.addBtnText}>+ New</Text></View>
        </View>
      </GlassCard>
      {content.map((c, i) => (
        <GlassCard key={i} style={[s.card, { padding: 14 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={s.typeBadge}><Text style={s.typeBadgeText}>{c.type}</Text></View>
            <View style={[s.statusBadge, { backgroundColor: c.status === 'Live' ? Colors.emeraldBreath : Colors.saffronGold }]}>
              <Text style={s.statusBadgeText}>{c.status}</Text>
            </View>
          </View>
          <Text style={s.contentTitle}>{c.title}</Text>
          <Text style={s.contentMeta}>{c.phase} phase · {c.locale}</Text>
        </GlassCard>
      ))}
    </>
  );
}

/* ---- AI Ops ---- */
function AITab() {
  return (
    <>
      <View style={s.statsGrid}>
        <StatCard label="API calls/24h" value={48219} delta="+6.1%" emoji="🧠" />
        <StatCard label="Latency p95" value="1.4s" delta="-0.2s" emoji="⚡" />
        <StatCard label="Token spend" value="$128.4" delta="+3.2%" emoji="💰" />
        <StatCard label="Error rate" value="0.12%" delta="-0.04%" emoji="🎯" />
      </View>
      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Claude Vision · zone accuracy</Text>
        {[['Forehead',94],['Cheeks',91],['Chin',97],['Jawline',96],['T-zone',93]].map(([z,a]) => (
          <View key={z as string} style={s.barRow}>
            <Text style={s.barLabel}>{z}</Text>
            <View style={s.barTrack}><View style={[s.barFill,{width:`${a as number}%`,backgroundColor:Colors.emeraldBreath}]} /></View>
            <Text style={s.barValue}>{a}%</Text>
          </View>
        ))}
      </GlassCard>
      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Saheli prompt versions</Text>
        {[
          { v:'v4.2', status:'Production', sat:94 },
          { v:'v4.3-beta', status:'Canary 10%', sat:96 },
          { v:'v4.1', status:'Archived', sat:92 },
        ].map((p) => (
          <View key={p.v} style={s.promptRow}>
            <Text style={s.promptVer}>{p.v}</Text>
            <View style={[s.statusBadge, {
              backgroundColor: p.status==='Production' ? Colors.emeraldBreath : p.status.includes('Canary') ? Colors.saffronGold : Colors.textMuted,
            }]}>
              <Text style={s.statusBadgeText}>{p.status}</Text>
            </View>
            <Text style={s.promptSat}>{p.sat}% sat</Text>
          </View>
        ))}
      </GlassCard>
    </>
  );
}

/* ---- Compliance ---- */
function ComplianceTab() {
  return (
    <>
      <GlassCard style={[s.card, { borderLeftWidth: 3, borderLeftColor: Colors.emeraldBreath }]}>
        <Text style={s.cardTitle}>🌿  DPDP Act status</Text>
        <Text style={s.cardSub}>Compliant · last audit 14 days ago</Text>
      </GlassCard>
      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Data deletion queue</Text>
        {[
          { id:'DR-7821', when:'2 hrs ago', status:'Processing' },
          { id:'DR-7820', when:'5 hrs ago', status:'Completed' },
          { id:'DR-7819', when:'1 day ago', status:'Completed' },
        ].map((r) => (
          <View key={r.id} style={s.complRow}>
            <Text style={s.complId}>#{r.id}</Text>
            <Text style={s.complWhen}>{r.when}</Text>
            <View style={[s.statusBadge, { backgroundColor: r.status==='Completed' ? Colors.emeraldBreath : Colors.saffronGold }]}>
              <Text style={s.statusBadgeText}>{r.status}</Text>
            </View>
          </View>
        ))}
      </GlassCard>
      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Consent ledger</Text>
        {[
          ['Core data processing','99.8%','Required'],
          ['Anonymous research','42.3%','Opt-in'],
          ['Skin image retention','78.1%','Opt-in'],
          ['Marketing','18.4%','Opt-in'],
        ].map(([label,pct,type]) => (
          <View key={label as string} style={s.consentRow}>
            <Text style={s.consentLabel}>{label}</Text>
            <Text style={s.consentPct}>{pct}</Text>
            <View style={s.consentBadge}><Text style={s.consentBadgeText}>{type}</Text></View>
          </View>
        ))}
      </GlassCard>
      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Recent audit log</Text>
        {[
          ['Admin login · 2FA','kashish@teamelle.in','14:32'],
          ['User data export','user#12847','12:18'],
          ['Content publish · v4.3','diya.s@teamelle.in','09:44'],
        ].map(([action,who,when],i) => (
          <View key={i} style={s.auditRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.auditAction}>{action}</Text>
              <Text style={s.auditWho}>{who}</Text>
            </View>
            <Text style={s.auditWhen}>{when}</Text>
          </View>
        ))}
      </GlassCard>
    </>
  );
}

/* ---- Styles ---- */
const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingVertical: 12,
  },
  headerLeft: { flex: 1, marginRight: 10 },
  badge: { backgroundColor:Colors.templeMaroon, paddingHorizontal:10, paddingVertical:4, borderRadius:999, marginBottom:6, alignSelf: 'flex-start' },
  badgeText: { color:Colors.saffronGold, fontSize:10, fontWeight:'800', letterSpacing:2 },
  heading: { ...Typography.h2, color:Colors.templeMaroon, fontStyle:'italic', fontWeight:'300' },
  headerBtns: { flexDirection: 'row', gap: 8, flexShrink: 0 },
  headerBtn: { paddingHorizontal:14, paddingVertical:8, borderRadius:Radius.pill, backgroundColor:'rgba(123,45,63,0.12)' },
  headerBtnText: { color:Colors.templeMaroon, fontSize:13, fontWeight:'700' },
  tabRow: { paddingHorizontal: PAD, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(123,45,63,0.12)',
    flexShrink: 0,
  },
  tabActive: { backgroundColor: Colors.templeMaroon },
  tabLabel: { color: Colors.textPrimary, fontWeight: '600', fontSize: 13, flexShrink: 0 },
  tabLabelActive: { color: Colors.lotusMist },
  statsGrid: { flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:6 },
  statCard: { width:(W-2*PAD-10)/2, backgroundColor:'rgba(255,245,247,0.85)', borderRadius:Radius.lg, padding:14, borderWidth:1, borderColor:'rgba(255,255,255,0.7)', ...Shadows.soft },
  statValue: { fontSize:24, fontWeight:'700', color:Colors.templeMaroon, marginTop:8 },
  statLabel: { fontSize:11, color:Colors.textSecondary, marginTop:2, fontWeight:'600' },
  statDelta: { fontSize:10, color:Colors.emeraldBreath, marginTop:4, fontWeight:'700' },
  card: { marginTop:12 },
  cardTitle: { ...Typography.bodyBold, color:Colors.templeMaroon },
  cardSub: { fontSize:12, color:Colors.textMuted, marginTop:2 },
  barRow: { flexDirection:'row', alignItems:'center', paddingVertical:6 },
  barLabel: { width:100, fontSize:12, color:Colors.textPrimary, fontWeight:'600' },
  barTrack: { flex:1, height:8, borderRadius:4, backgroundColor:'rgba(123,45,63,0.1)', overflow:'hidden', marginHorizontal:10 },
  barFill: { height:'100%', backgroundColor:Colors.templeMaroon, borderRadius:4 },
  barValue: { fontSize:11, color:Colors.templeMaroon, fontWeight:'700', width:60, textAlign:'right' },
  histBar: { width:'100%', borderTopLeftRadius:6, borderTopRightRadius:6 },
  histLabel: { fontSize:10, color:Colors.textSecondary, marginTop:6, fontWeight:'600' },
  histCount: { fontSize:10, color:Colors.templeMaroon, fontWeight:'700' },
  searchBar: { backgroundColor:'rgba(255,255,255,0.5)', paddingHorizontal:14, paddingVertical:10, borderRadius:10 },
  filterRow: { flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:10 },
  filterChip: { paddingHorizontal:10, paddingVertical:5, borderRadius:999, backgroundColor:'rgba(232,168,124,0.25)' },
  filterChipText: { fontSize:11, color:Colors.templeMaroon, fontWeight:'600' },
  userRow: { flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'rgba(123,45,63,0.08)' },
  userAvatar: { width:36, height:36, borderRadius:18, backgroundColor:Colors.templeMaroon, alignItems:'center', justifyContent:'center', marginRight:10 },
  userName: { fontSize:13, fontWeight:'700', color:Colors.textPrimary },
  userMeta: { fontSize:11, color:Colors.textMuted },
  riskChip: { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:8, paddingVertical:4, borderRadius:999, backgroundColor:'rgba(255,255,255,0.6)' },
  riskDot: { width:6, height:6, borderRadius:3 },
  riskText: { fontSize:11, fontWeight:'700', color:Colors.templeMaroon },
  addBtn: { backgroundColor:Colors.templeMaroon, paddingHorizontal:12, paddingVertical:6, borderRadius:999 },
  addBtnText: { color:Colors.lotusMist, fontWeight:'700', fontSize:12 },
  typeBadge: { backgroundColor:'rgba(232,168,124,0.25)', paddingHorizontal:8, paddingVertical:3, borderRadius:6, marginRight:6 },
  typeBadgeText: { fontSize:10, fontWeight:'700', color:Colors.templeMaroon, letterSpacing:0.5 },
  statusBadge: { paddingHorizontal:8, paddingVertical:3, borderRadius:6 },
  statusBadgeText: { fontSize:10, fontWeight:'700', color:'#fff', letterSpacing:0.3 },
  contentTitle: { fontSize:14, fontWeight:'700', color:Colors.textPrimary, marginTop:4 },
  contentMeta: { fontSize:11, color:Colors.textMuted, marginTop:2 },
  promptRow: { flexDirection:'row', alignItems:'center', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'rgba(123,45,63,0.08)' },
  promptVer: { width:80, fontSize:13, fontWeight:'700', color:Colors.templeMaroon },
  promptSat: { fontSize:11, color:Colors.textMuted, marginLeft:'auto' },
  complRow: { flexDirection:'row', alignItems:'center', paddingVertical:8, gap:10, borderBottomWidth:1, borderBottomColor:'rgba(123,45,63,0.08)' },
  complId: { fontSize:12, fontWeight:'700', color:Colors.templeMaroon },
  complWhen: { flex:1, fontSize:11, color:Colors.textMuted },
  consentRow: { flexDirection:'row', alignItems:'center', paddingVertical:8, gap:8 },
  consentLabel: { flex:1, fontSize:12, color:Colors.textPrimary, fontWeight:'500' },
  consentPct: { fontSize:13, fontWeight:'700', color:Colors.templeMaroon, width:50, textAlign:'right' },
  consentBadge: { backgroundColor:'rgba(123,45,63,0.1)', paddingHorizontal:8, paddingVertical:3, borderRadius:6 },
  consentBadgeText: { fontSize:10, fontWeight:'600', color:Colors.templeMaroon },
  auditRow: { flexDirection:'row', alignItems:'center', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'rgba(123,45,63,0.08)' },
  auditAction: { fontSize:13, fontWeight:'600', color:Colors.textPrimary },
  auditWho: { fontSize:11, color:Colors.textMuted, marginTop:2 },
  auditWhen: { fontSize:11, color:Colors.templeMaroon, fontWeight:'700' },
});
