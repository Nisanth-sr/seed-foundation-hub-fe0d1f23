import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import {
  BIG_FIVE_QUESTIONS,
  RIASEC_QUESTIONS,
  CAREERS,
  level,
} from "@seed/career-core";
import type { UserDetail } from "./users";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#000" },
  title: { fontSize: 18, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 11, marginBottom: 16, color: "#333" },
  h2: { fontSize: 13, marginTop: 14, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 140, fontFamily: "Helvetica-Bold" },
  value: { flex: 1 },
  muted: { color: "#555", marginBottom: 4 },
  bullet: { marginBottom: 2, paddingLeft: 8 },
  score: { marginBottom: 2 },
});

function ScoreList({
  scores,
  labels,
}: {
  scores: Record<string, number>;
  labels: Record<string, string>;
}) {
  return (
    <View>
      {Object.entries(scores).map(([k, v]) => (
        <Text key={k} style={styles.score}>
          {labels[k] ?? k}: {v}/100 ({level(v)})
        </Text>
      ))}
    </View>
  );
}

function AssessmentPdfDoc({ detail }: { detail: UserDetail }) {
  const traitLabels: Record<string, string> = {
    O: "Openness",
    C: "Conscientiousness",
    E: "Extraversion",
    A: "Agreeableness",
    N: "Emotional Stability",
  };
  const riLabels: Record<string, string> = {
    R: "Realistic",
    I: "Investigative",
    A: "Artistic",
    S: "Social",
    E: "Enterprising",
    C: "Conventional",
  };
  const savedTitles = detail.savedCareers.map((s) => {
    const c = CAREERS.find((x) => x.key === s.careerKey);
    return c?.title_en ?? s.careerKey;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>SEED Career Assessment Report</Text>
        <Text style={styles.subtitle}>
          {detail.displayName} · {detail.email} · Generated {new Date().toLocaleDateString()}
        </Text>

        <Text style={styles.h2}>Profile</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Locale</Text>
          <Text style={styles.value}>{detail.locale}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{detail.phone ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Age range</Text>
          <Text style={styles.value}>{detail.ageRange ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{[detail.city, detail.state].filter(Boolean).join(", ") || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Education</Text>
          <Text style={styles.value}>{detail.educationLevel ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{detail.currentStatus ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>School / college</Text>
          <Text style={styles.value}>{detail.schoolOrCollege ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Languages</Text>
          <Text style={styles.value}>
            {detail.languagesSpoken.length ? detail.languagesSpoken.join(", ") : "—"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Holland Code</Text>
          <Text style={styles.value}>{detail.hollandCode ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Joined</Text>
          <Text style={styles.value}>{new Date(detail.createdAt).toLocaleString()}</Text>
        </View>

        <Text style={styles.h2}>Big Five Scores</Text>
        {detail.bigFive.scores ? (
          <ScoreList scores={detail.bigFive.scores} labels={traitLabels} />
        ) : (
          <Text style={styles.muted}>No Big Five scores</Text>
        )}

        <Text style={styles.h2}>Big Five Answers</Text>
        {BIG_FIVE_QUESTIONS.map((q) => (
          <Text key={q.id} style={styles.bullet}>
            [{q.id}] {q.en}: {detail.bigFive.answers[q.id] ?? "—"}/5
          </Text>
        ))}

        <Text style={styles.h2}>RIASEC Scores</Text>
        {detail.riasec.scores ? (
          <ScoreList scores={detail.riasec.scores} labels={riLabels} />
        ) : (
          <Text style={styles.muted}>No RIASEC scores</Text>
        )}

        <Text style={styles.h2}>RIASEC Answers</Text>
        {RIASEC_QUESTIONS.map((q) => (
          <Text key={q.id} style={styles.bullet}>
            [{q.id}] {q.en}: {detail.riasec.answers[q.id] ?? "—"}/5
          </Text>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Career Matches</Text>
        {detail.careerMatches.length === 0 ? (
          <Text style={styles.muted}>Complete both assessments for matches</Text>
        ) : (
          detail.careerMatches.map((m) => (
            <Text key={m.career.key} style={styles.bullet}>
              {m.career.title_en} — {m.score}% ({m.reasons.join("; ")})
            </Text>
          ))
        )}

        <Text style={styles.h2}>Saved Careers</Text>
        {savedTitles.length === 0 ? (
          <Text style={styles.muted}>None</Text>
        ) : (
          savedTitles.map((t) => (
            <Text key={t} style={styles.bullet}>
              • {t}
            </Text>
          ))
        )}

        <Text style={styles.h2}>AI Analysis</Text>
        {!detail.analysis ? (
          <Text style={styles.muted}>No AI report generated yet</Text>
        ) : (
          <View>
            <Text style={styles.muted}>
              Model: {detail.analysis.model} · Updated{" "}
              {new Date(detail.analysis.updatedAt).toLocaleString()}
            </Text>
            <Text style={{ marginBottom: 6 }}>{detail.analysis.analysis.summary}</Text>
            <Text style={styles.h2}>Strengths</Text>
            {detail.analysis.analysis.strengths.map((s, i) => (
              <Text key={i} style={styles.bullet}>
                • {s}
              </Text>
            ))}
            <Text style={styles.h2}>Growth Areas</Text>
            {detail.analysis.analysis.growthAreas.map((s, i) => (
              <Text key={i} style={styles.bullet}>
                • {s}
              </Text>
            ))}
            <Text style={styles.h2}>Career Guidance</Text>
            <Text>{detail.analysis.analysis.careerGuidance}</Text>
            <Text style={styles.h2}>Counselor Notes</Text>
            <Text>{detail.analysis.analysis.counselorNotes}</Text>
            <Text style={{ marginTop: 12, fontSize: 8, color: "#666" }}>
              {detail.analysis.analysis.disclaimer}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderUserPdf(detail: UserDetail): Promise<Buffer> {
  const buffer = await renderToBuffer(<AssessmentPdfDoc detail={detail} />);
  return Buffer.from(buffer);
}

export function pdfFilename(detail: UserDetail): string {
  const safe = detail.displayName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "user";
  const date = new Date().toISOString().slice(0, 10);
  return `seed-assessment-${safe}-${date}.pdf`;
}
