"use client";

import { useMemo, useState } from "react";

type ModeId = "read" | "steps" | "focus" | "keywords";
type Stage = "configure" | "review" | "shared";

const lessons = [
  {
    title: "數學應用題 · 五年級",
    worksheetTitle: "解決生活中的數學問題",
    instruction: "請仔細閱讀以下題目，列出算式，並把答案連同單位寫在橫線上。",
    question: "學校圖書館原有 248 本故事書，星期一借出了 79 本，星期二又購入了 35 本。現在圖書館有多少本故事書？",
    keywords: ["原有", "借出", "購入", "現在", "248", "79", "35"],
    steps: [
      { before: "先找出圖書館", keyword: "原來", after: "有多少本書。", label: "原有故事書", value: "248", unit: "本" },
      { before: "再找出星期一", keyword: "借出", after: "了多少本書。", label: "星期一借出", value: "79", unit: "本" },
      { before: "最後找出星期二", keyword: "購入", after: "了多少本書。", label: "星期二購入", value: "35", unit: "本" },
    ],
  },
  {
    title: "數學應用題 · 四年級",
    worksheetTitle: "認識加減法關係",
    instruction: "圈出有用的資料，寫出算式，並在橫線上寫出答案。",
    question: "水果店早上有 186 個蘋果，上午賣出了 54 個，下午運來了 40 個。水果店現在有多少個蘋果？",
    keywords: ["早上", "賣出", "運來", "現在", "186", "54", "40"],
    steps: [
      { before: "先找出水果店", keyword: "早上", after: "有多少個蘋果。", label: "早上的蘋果", value: "186", unit: "個" },
      { before: "再找出上午", keyword: "賣出", after: "了多少個。", label: "上午賣出", value: "54", unit: "個" },
      { before: "最後找出下午", keyword: "運來", after: "了多少個。", label: "下午運來", value: "40", unit: "個" },
    ],
  },
  {
    title: "數學應用題 · 三年級",
    worksheetTitle: "處理兩步應用題",
    instruction: "閱讀題目後，把重要數字填進方格，再完成計算。",
    question: "校巴上原有 32 名學生，第一站下車 8 人，第二站又上車 5 人。現在校巴上有多少名學生？",
    keywords: ["原有", "下車", "上車", "現在", "32", "8", "5"],
    steps: [
      { before: "先找出校巴上", keyword: "原來", after: "有多少名學生。", label: "原有學生", value: "32", unit: "人" },
      { before: "再找出第一站", keyword: "下車", after: "多少人。", label: "第一站下車", value: "8", unit: "人" },
      { before: "最後找出第二站", keyword: "上車", after: "多少人。", label: "第二站上車", value: "5", unit: "人" },
    ],
  },
];

const supportModes: { id: ModeId; icon: string; label: string }[] = [
  { id: "read", icon: "耳", label: "語音朗讀" },
  { id: "steps", icon: "步", label: "分步顯示" },
  { id: "focus", icon: "眼", label: "專注模式" },
  { id: "keywords", icon: "詞", label: "關鍵詞提示" },
];

export default function Home() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [modes, setModes] = useState<Record<ModeId, boolean>>({ read: true, steps: true, focus: true, keywords: false });
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("configure");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const lesson = lessons[lessonIndex];
  const step = lesson.steps[stepIndex];
  const numberChoices = useMemo(
    () => [lesson.steps[1].value, lesson.steps[2].value, lesson.steps[0].value],
    [lesson],
  );
  const isCorrectChoice = selectedValue === step.value;

  const activeCount = useMemo(() => Object.values(modes).filter(Boolean).length, [modes]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function toggleMode(id: ModeId) {
    const nextEnabled = !modes[id];
    setModes((current) => ({ ...current, [id]: !current[id] }));
    setStage("configure");
    setSelectedValue(null);
    const label = supportModes.find((mode) => mode.id === id)?.label ?? "學習支援";
    notify(`${label}${nextEnabled ? "已開啟" : "已關閉"}`);
  }

  function generateVersion() {
    if (activeCount === 0) {
      notify("請至少選擇一種學習支援");
      return;
    }
    setStage("review");
    setStepIndex(0);
    setSelectedValue(null);
    notify("學生版本已經生成，請教師確認");
  }

  function chooseLesson(index: number) {
    setLessonIndex(index);
    setStepIndex(0);
    setSelectedValue(null);
    setStage("configure");
    setPickerOpen(false);
    notify("已換成新的示例練習");
  }

  function speak() {
    if (!("speechSynthesis" in window)) {
      notify("目前瀏覽器不支援朗讀");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(modes.steps ? `${step.before}${step.keyword}${step.after}` : lesson.question);
    utterance.lang = "zh-HK";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
    notify("正在朗讀目前內容");
  }

  async function copyStudentLink() {
    const link = `${window.location.origin}${window.location.pathname}?view=student`;
    try {
      await navigator.clipboard.writeText(link);
      notify("學生連結已複製");
    } catch {
      notify("演示連結已準備好");
    }
  }

  function chooseStepValue(value: string) {
    setSelectedValue(value);
    notify(value === step.value ? "找到了！現在可以進入下一步" : "再看看題目，這個數字代表其他資料");
  }

  function moveToStep(nextIndex: number) {
    setStepIndex(nextIndex);
    setSelectedValue(null);
  }

  function highlightQuestion(text: string) {
    if (!modes.keywords) return text;
    const pattern = new RegExp(`(${lesson.keywords.join("|")})`, "g");
    return text.split(pattern).map((part, index) => lesson.keywords.includes(part)
      ? <mark key={`${part}-${index}`}>{part}</mark>
      : part);
  }

  const stageNumber = stage === "configure" ? 1 : stage === "review" ? 2 : 3;

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" aria-label="明路首頁" onClick={() => window.location.reload()}>
          <span className="brand-mark" aria-hidden="true">明</span>
          <span><strong>明路</strong><small>SEN 學習導航器</small></span>
        </button>
        <div className="top-actions">
          <span className="prototype-pill">互動原型</span>
          <div className="teacher-chip"><span className="status-dot" />教師預覽模式</div>
        </div>
      </header>

      <section className="intro-row">
        <div>
          <p className="eyebrow">教材無障礙轉換</p>
          <h1>讓題目更好懂，<em>不是把題目變簡單。</em></h1>
        </div>
        <div className="step-track" aria-label={`目前在第 ${stageNumber} 步`}>
          <span className={`step ${stageNumber >= 1 ? "current" : ""}`}><b>1</b>選擇支援</span><i />
          <span className={`step ${stageNumber >= 2 ? "current" : ""}`}><b>2</b>教師確認</span><i />
          <span className={`step ${stageNumber >= 3 ? "current" : ""}`}><b>3</b>發給學生</span>
        </div>
      </section>

      <section className="workspace">
        <article className="panel source-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">原始練習</span><h2>{lesson.title}</h2></div>
            <button className="text-button" type="button" onClick={() => setPickerOpen(true)}>更換練習</button>
          </div>
          <div className="paper original-paper">
            <div className="paper-meta"><span>姓名：____________</span><span>日期：____________</span></div>
            <h3>{lesson.worksheetTitle}</h3>
            <p className="instruction">{lesson.instruction}</p>
            <div className="question-block"><span className="question-number">1</span><p>{lesson.question}</p></div>
            <div className="answer-lines" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="source-note">
            <span aria-hidden="true">✓</span>
            <p><strong>學習目標保持不變</strong><small>只調整顯示方式，不改題，也不提供答案。</small></p>
          </div>
        </article>

        <aside className="mode-panel">
          <span className="panel-kicker">選擇學生需要的支援</span>
          <h2>這次怎樣呈現？</h2>
          <div className="mode-list">
            {supportModes.map((mode) => (
              <button className={`mode-card ${modes[mode.id] ? "active" : ""}`} key={mode.id} type="button" aria-pressed={modes[mode.id]} onClick={() => toggleMode(mode.id)}>
                <span className="mode-icon" aria-hidden="true">{mode.icon}</span><span>{mode.label}</span><i aria-hidden="true" />
              </button>
            ))}
          </div>
          <button className="primary-button" type="button" onClick={generateVersion}>生成學生版本 <span>→</span></button>
          <p className="privacy-copy">本原型不會上傳或儲存學生資料</p>
        </aside>

        <article className={`panel preview-panel ${stage === "shared" ? "shared" : ""} ${modes.focus && stage !== "shared" ? "focus-mode" : ""}`}>
          <div className="panel-heading">
            <div><span className="panel-kicker mint">學生預覽</span><h2>{stage === "shared" ? "版本已準備好" : modes.steps && modes.focus ? `專注模式 · 第 ${stepIndex + 1} 步` : modes.steps ? `分步顯示 · 第 ${stepIndex + 1} 步` : modes.focus ? "專注閱讀模式" : "完整題目模式"}</h2></div>
            <span className="preview-badge">{stage === "review" ? "待教師確認" : stage === "shared" ? "已完成" : "即時預覽"}</span>
          </div>

          {stage === "shared" ? (
            <div className="share-card">
              <span className="share-check" aria-hidden="true">✓</span>
              <p className="share-eyebrow">學生版本已建立</p>
              <h3>準備發給學生</h3>
              <p>練習目標沒有改變，學生將使用你確認過的 {activeCount} 種學習支援。</p>
              <div className="share-code"><small>課堂代碼</small><strong>ML-248</strong></div>
              <button className="next-button" type="button" onClick={copyStudentLink}>複製學生連結 <span>↗</span></button>
              <button className="secondary-button" type="button" onClick={() => setStage("configure")}>返回編輯</button>
            </div>
          ) : (
            <>
              <div className={`paper accessible-paper ${modes.focus ? "focus-on" : ""}`}>
                {modes.focus && (
                    <div className="focus-status" aria-live="polite">
                      <span aria-hidden="true">眼</span>
                      <p><strong>專注模式已開啟</strong><small>畫面會突出目前要處理的內容</small></p>
                    </div>
                )}
                {modes.steps ? (
                  <>
                    <div className="progress-label"><span>第 1 題</span><strong>{stepIndex + 1} / {lesson.steps.length} 步</strong></div>
                    <div className="progress-bar"><i style={{ width: `${((stepIndex + 1) / lesson.steps.length) * 100}%` }} /></div>
                    {modes.read && <button className="listen-button" type="button" onClick={speak}><span aria-hidden="true">▶</span> 朗讀這一段</button>}
                    <p className="focus-instruction">{step.before}{modes.keywords ? <strong>{step.keyword}</strong> : step.keyword}{step.after}</p>
                    <div className="guided-choice">
                      <p className="choice-label">先閱讀題目，再選出正確數字</p>
                      <p className="choice-question">{highlightQuestion(lesson.question)}</p>
                      <div className="number-options" aria-label={`選擇${step.label}的數字`}>
                        {numberChoices.map((value) => {
                          const selected = selectedValue === value;
                          const correct = selected && value === step.value;
                          return (
                            <button
                              className={selected ? correct ? "correct" : "incorrect" : ""}
                              type="button"
                              key={value}
                              aria-pressed={selected}
                              onClick={() => chooseStepValue(value)}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                      {selectedValue && (
                        <div className={`choice-feedback ${isCorrectChoice ? "correct" : "try-again"}`} role="status">
                          <span aria-hidden="true">{isCorrectChoice ? "✓" : "↺"}</span>
                          <p><strong>{isCorrectChoice ? `找到了：${step.value}${step.unit}` : "再試一次"}</strong><small>{isCorrectChoice ? "這項資料正確，可以進入下一步。" : "看看這個數字在題目中代表甚麼。"}</small></p>
                        </div>
                      )}
                    </div>
                    <div className="step-actions">
                      <button className="back-button" type="button" disabled={stepIndex === 0} onClick={() => moveToStep(stepIndex - 1)}>上一步</button>
                      <button className="next-button" type="button" disabled={!isCorrectChoice} onClick={() => moveToStep(stepIndex === lesson.steps.length - 1 ? 0 : stepIndex + 1)}>
                        {!isCorrectChoice ? selectedValue ? "再選一次" : "先選一個數字" : stepIndex === lesson.steps.length - 1 ? "完成資料整理" : "答對了，下一步"}<span>→</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {modes.read && <button className="listen-button" type="button" onClick={speak}><span aria-hidden="true">▶</span> 朗讀整道題</button>}
                    <p className="full-question">{highlightQuestion(lesson.question)}</p>
                    <div className="fact-row">{lesson.steps.map((fact) => <span key={fact.label}><small>{fact.label}</small><strong>{fact.value}{fact.unit}</strong></span>)}</div>
                  </>
                )}
              </div>
              <div className="preview-footer">
                <span><i className="legend-dot teal" />{modes.steps ? "一次只顯示一個步驟" : "顯示完整題目"}</span>
                <span><i className="legend-dot amber" />{modes.keywords ? "重點已經標示" : "可開啟關鍵詞提示"}</span>
                <span><i className={`legend-dot ${modes.focus ? "focus-active" : "focus-inactive"}`} />{modes.focus ? "專注模式已開啟" : "專注模式未開啟"}</span>
              </div>
              {stage === "review" && <button className="confirm-button" type="button" onClick={() => { setStage("shared"); notify("教師已確認，學生版本可以發送"); }}>教師確認：可以發給學生</button>}
            </>
          )}
        </article>
      </section>

      {pickerOpen && (
        <div className="modal-backdrop">
          <button className="modal-close-layer" type="button" aria-label="關閉練習選擇視窗" onClick={() => setPickerOpen(false)} />
          <section className="lesson-picker" role="dialog" aria-modal="true" aria-labelledby="picker-title">
            <div className="picker-heading"><div><p className="eyebrow">原型示例</p><h2 id="picker-title">選擇另一份練習</h2></div><button type="button" aria-label="關閉" onClick={() => setPickerOpen(false)}>×</button></div>
            <p className="picker-copy">為了如實展示核心體驗，本原型使用三份預設教材，不假裝已經接入自動識別模型。</p>
            <div className="lesson-options">{lessons.map((item, index) => (
              <button className={index === lessonIndex ? "selected" : ""} key={item.question} type="button" onClick={() => chooseLesson(index)}>
                <span>{index + 1}</span><p><strong>{item.title}</strong><small>{item.question}</small></p><i>→</i>
              </button>
            ))}</div>
          </section>
        </div>
      )}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}
