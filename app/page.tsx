"use client";

import { useMemo, useState } from "react";

type ModeId = "read" | "steps" | "focus" | "keywords";
type Stage = "configure" | "review" | "shared";

const lessons = [
  {
    title: "数学应用题 · 五年级",
    worksheetTitle: "解决生活中的数学问题",
    instruction: "请仔细阅读以下题目，列出算式，并把答案连同单位写在横线上。",
    question: "学校图书馆原有 248 本故事书，星期一借出了 79 本，星期二又购入了 35 本。现在图书馆有多少本故事书？",
    keywords: ["原有", "借出", "购入", "现在", "248", "79", "35"],
    steps: [
      { before: "先找出图书馆", keyword: "原来", after: "有多少本书。", label: "原有故事书", value: "248", unit: "本" },
      { before: "再找出星期一", keyword: "借出", after: "了多少本书。", label: "星期一借出", value: "79", unit: "本" },
      { before: "最后找出星期二", keyword: "购入", after: "了多少本书。", label: "星期二购入", value: "35", unit: "本" },
    ],
  },
  {
    title: "数学应用题 · 四年级",
    worksheetTitle: "认识加减法关系",
    instruction: "圈出有用的资料，写出算式，并在横线上写出答案。",
    question: "水果店早上有 186 个苹果，上午卖出了 54 个，下午运来了 40 个。水果店现在有多少个苹果？",
    keywords: ["早上", "卖出", "运来", "现在", "186", "54", "40"],
    steps: [
      { before: "先找出水果店", keyword: "早上", after: "有多少个苹果。", label: "早上的苹果", value: "186", unit: "个" },
      { before: "再找出上午", keyword: "卖出", after: "了多少个。", label: "上午卖出", value: "54", unit: "个" },
      { before: "最后找出下午", keyword: "运来", after: "了多少个。", label: "下午运来", value: "40", unit: "个" },
    ],
  },
  {
    title: "数学应用题 · 三年级",
    worksheetTitle: "处理两步应用题",
    instruction: "阅读题目后，把重要数字填进方格，再完成计算。",
    question: "校巴上原有 32 名学生，第一站下车 8 人，第二站又上车 5 人。现在校巴上有多少名学生？",
    keywords: ["原有", "下车", "上车", "现在", "32", "8", "5"],
    steps: [
      { before: "先找出校巴上", keyword: "原来", after: "有多少名学生。", label: "原有学生", value: "32", unit: "人" },
      { before: "再找出第一站", keyword: "下车", after: "多少人。", label: "第一站下车", value: "8", unit: "人" },
      { before: "最后找出第二站", keyword: "上车", after: "多少人。", label: "第二站上车", value: "5", unit: "人" },
    ],
  },
];

const supportModes: { id: ModeId; icon: string; label: string }[] = [
  { id: "read", icon: "耳", label: "语音朗读" },
  { id: "steps", icon: "步", label: "分步显示" },
  { id: "focus", icon: "眼", label: "专注模式" },
  { id: "keywords", icon: "词", label: "关键词提示" },
];

export default function Home() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [modes, setModes] = useState<Record<ModeId, boolean>>({ read: true, steps: true, focus: true, keywords: false });
  const [stepIndex, setStepIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("configure");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const lesson = lessons[lessonIndex];
  const step = lesson.steps[stepIndex];

  const activeCount = useMemo(() => Object.values(modes).filter(Boolean).length, [modes]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function toggleMode(id: ModeId) {
    const nextEnabled = !modes[id];
    setModes((current) => ({ ...current, [id]: !current[id] }));
    setStage("configure");
    const label = supportModes.find((mode) => mode.id === id)?.label ?? "学习支持";
    notify(`${label}${nextEnabled ? "已开启" : "已关闭"}`);
  }

  function generateVersion() {
    if (activeCount === 0) {
      notify("请至少选择一种学习支持");
      return;
    }
    setStage("review");
    setStepIndex(0);
    notify("学生版本已经生成，请教师确认");
  }

  function chooseLesson(index: number) {
    setLessonIndex(index);
    setStepIndex(0);
    setStage("configure");
    setPickerOpen(false);
    notify("已换成新的示例练习");
  }

  function speak() {
    if (!("speechSynthesis" in window)) {
      notify("当前浏览器不支持朗读");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(modes.steps ? `${step.before}${step.keyword}${step.after} ${step.label}，${step.value}${step.unit}` : lesson.question);
    utterance.lang = "zh-CN";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
    notify("正在朗读当前内容");
  }

  async function copyStudentLink() {
    const link = `${window.location.origin}${window.location.pathname}?view=student`;
    try {
      await navigator.clipboard.writeText(link);
      notify("学生链接已复制");
    } catch {
      notify("演示链接已准备好");
    }
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
        <button className="brand" type="button" aria-label="明路首页" onClick={() => window.location.reload()}>
          <span className="brand-mark" aria-hidden="true">明</span>
          <span><strong>明路</strong><small>SEN 学习导航器</small></span>
        </button>
        <div className="top-actions">
          <span className="prototype-pill">交互原型</span>
          <div className="teacher-chip"><span className="status-dot" />教师预览模式</div>
        </div>
      </header>

      <section className="intro-row">
        <div>
          <p className="eyebrow">教材无障碍转换</p>
          <h1>让题目更好懂，<em>不是把题目变简单。</em></h1>
        </div>
        <div className="step-track" aria-label={`当前在第 ${stageNumber} 步`}>
          <span className={`step ${stageNumber >= 1 ? "current" : ""}`}><b>1</b>选择支持</span><i />
          <span className={`step ${stageNumber >= 2 ? "current" : ""}`}><b>2</b>教师确认</span><i />
          <span className={`step ${stageNumber >= 3 ? "current" : ""}`}><b>3</b>发给学生</span>
        </div>
      </section>

      <section className="workspace">
        <article className="panel source-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">原始练习</span><h2>{lesson.title}</h2></div>
            <button className="text-button" type="button" onClick={() => setPickerOpen(true)}>更换练习</button>
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
            <p><strong>学习目标保持不变</strong><small>只调整显示方式，不改题，也不提供答案。</small></p>
          </div>
        </article>

        <aside className="mode-panel">
          <span className="panel-kicker">选择学生需要的支持</span>
          <h2>这次怎样呈现？</h2>
          <div className="mode-list">
            {supportModes.map((mode) => (
              <button className={`mode-card ${modes[mode.id] ? "active" : ""}`} key={mode.id} type="button" aria-pressed={modes[mode.id]} onClick={() => toggleMode(mode.id)}>
                <span className="mode-icon" aria-hidden="true">{mode.icon}</span><span>{mode.label}</span><i aria-hidden="true" />
              </button>
            ))}
          </div>
          <button className="primary-button" type="button" onClick={generateVersion}>生成学生版本 <span>→</span></button>
          <p className="privacy-copy">本原型不会上传或保存学生资料</p>
        </aside>

        <article className={`panel preview-panel ${stage === "shared" ? "shared" : ""} ${modes.focus && stage !== "shared" ? "focus-mode" : ""}`}>
          <div className="panel-heading">
            <div><span className="panel-kicker mint">学生预览</span><h2>{stage === "shared" ? "版本已准备好" : modes.steps && modes.focus ? `专注模式 · 第 ${stepIndex + 1} 步` : modes.steps ? `分步显示 · 第 ${stepIndex + 1} 步` : modes.focus ? "专注阅读模式" : "完整题目模式"}</h2></div>
            <span className="preview-badge">{stage === "review" ? "待教师确认" : stage === "shared" ? "已完成" : "即时预览"}</span>
          </div>

          {stage === "shared" ? (
            <div className="share-card">
              <span className="share-check" aria-hidden="true">✓</span>
              <p className="share-eyebrow">学生版本已建立</p>
              <h3>准备发给学生</h3>
              <p>练习目标没有改变，学生将使用你确认过的 {activeCount} 种学习支持。</p>
              <div className="share-code"><small>课堂代码</small><strong>ML-248</strong></div>
              <button className="next-button" type="button" onClick={copyStudentLink}>复制学生链接 <span>↗</span></button>
              <button className="secondary-button" type="button" onClick={() => setStage("configure")}>返回编辑</button>
            </div>
          ) : (
            <>
              <div className={`paper accessible-paper ${modes.focus ? "focus-on" : ""}`}>
                {modes.focus && (
                  <div className="focus-status" aria-live="polite">
                    <span aria-hidden="true">眼</span>
                    <p><strong>专注模式已开启</strong><small>画面会突出当前要处理的内容</small></p>
                  </div>
                )}
                {modes.steps ? (
                  <>
                    <div className="progress-label"><span>第 1 题</span><strong>{stepIndex + 1} / {lesson.steps.length} 步</strong></div>
                    <div className="progress-bar"><i style={{ width: `${((stepIndex + 1) / lesson.steps.length) * 100}%` }} /></div>
                    {modes.read && <button className="listen-button" type="button" onClick={speak}><span aria-hidden="true">▶</span> 朗读这一段</button>}
                    <p className="focus-instruction">{step.before}{modes.keywords ? <strong>{step.keyword}</strong> : step.keyword}{step.after}</p>
                    <div className="number-card"><small>{step.label}</small><strong>{step.value} <em>{step.unit}</em></strong></div>
                    <div className="step-actions">
                      <button className="back-button" type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => value - 1)}>上一步</button>
                      <button className="next-button" type="button" onClick={() => setStepIndex((value) => value === lesson.steps.length - 1 ? 0 : value + 1)}>
                        {stepIndex === lesson.steps.length - 1 ? "重新查看" : "我找到了，下一步"}<span>→</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {modes.read && <button className="listen-button" type="button" onClick={speak}><span aria-hidden="true">▶</span> 朗读整道题</button>}
                    <p className="full-question">{highlightQuestion(lesson.question)}</p>
                    <div className="fact-row">{lesson.steps.map((fact) => <span key={fact.label}><small>{fact.label}</small><strong>{fact.value}{fact.unit}</strong></span>)}</div>
                  </>
                )}
              </div>
              <div className="preview-footer">
                <span><i className="legend-dot teal" />{modes.steps ? "一次只显示一个步骤" : "显示完整题目"}</span>
                <span><i className="legend-dot amber" />{modes.keywords ? "重点已经标示" : "可开启关键词提示"}</span>
                <span><i className={`legend-dot ${modes.focus ? "focus-active" : "focus-inactive"}`} />{modes.focus ? "专注模式已开启" : "专注模式未开启"}</span>
              </div>
              {stage === "review" && <button className="confirm-button" type="button" onClick={() => { setStage("shared"); notify("教师已确认，学生版本可以发送"); }}>教师确认：可以发给学生</button>}
            </>
          )}
        </article>
      </section>

      {pickerOpen && (
        <div className="modal-backdrop">
          <button className="modal-close-layer" type="button" aria-label="关闭练习选择窗口" onClick={() => setPickerOpen(false)} />
          <section className="lesson-picker" role="dialog" aria-modal="true" aria-labelledby="picker-title">
            <div className="picker-heading"><div><p className="eyebrow">原型示例</p><h2 id="picker-title">选择另一份练习</h2></div><button type="button" aria-label="关闭" onClick={() => setPickerOpen(false)}>×</button></div>
            <p className="picker-copy">为了诚实展示核心体验，本原型使用三份预设教材，不假装已经接入自动识别模型。</p>
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
