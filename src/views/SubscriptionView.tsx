import { Check, Sparkles } from 'lucide-react'

export function SubscriptionView() {
  return (
    <main id="main-content" className="simple-workspace-page">
      <header>
        <p className="eyebrow">SUBSCRIPTION</p>
        <h1>A plan that grows with your research.</h1>
        <p>Review your current usage and compare the study capacity available to you.</p>
      </header>
      <section className="subscription-layout">
        <article className="current-plan-panel">
          <div><span><Sparkles size={18} />Current plan</span><strong>Student</strong></div>
          <p>68 of 100 AI questions used</p>
          <div className="usage-meter"><span style={{ width: '68%' }} /></div>
          <small>Usage resets on July 1, 2026</small>
        </article>
        <div className="plan-grid">
          <article>
            <p className="eyebrow">FREE</p><h2>$0</h2><span>For trying grounded document search.</span>
            <ul><li><Check size={15} />10 AI questions</li><li><Check size={15} />5 documents</li></ul>
            <button type="button" disabled>Current baseline</button>
          </article>
          <article className="featured">
            <p className="eyebrow">STUDENT</p><h2>$6 <small>/ month</small></h2><span>For active coursework and research.</span>
            <ul><li><Check size={15} />100 AI questions</li><li><Check size={15} />100 documents</li></ul>
            <button type="button">Manage Student plan</button>
          </article>
          <article>
            <p className="eyebrow">PRO</p><h2>$14 <small>/ month</small></h2><span>For intensive academic workflows.</span>
            <ul><li><Check size={15} />500 AI questions</li><li><Check size={15} />Unlimited documents</li></ul>
            <button type="button">Upgrade to Pro</button>
          </article>
        </div>
      </section>
    </main>
  )
}
