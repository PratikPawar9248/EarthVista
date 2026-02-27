# Geospatial Intelligence Platform - Requirements Document (v4.6 - OCEANLAB Button Addition)

---

## Critical Update (v4.6)\n
**NEW FEATURE**: Added OCEANLAB button on the main welcome/upload screen (Screenshot 2026-01-27 054253.png) - button redirects to Sea Plotter Pro platform.\n
---

## 1. Button Integration Overview

The platform now includes three external navigation buttons on the main welcome/upload screen:

| **Button Name** | **Target URL** | **Location** | **Status** |
|----------------|---------------|-------------|------------|
| **2D/3D Plots** | https://ocean-explorer-pro.lovable.app/ | Top navigation bar | ✅ Existing (v4.5) |
| **JNEXA AI** | https://veda-wise-mind.lovable.app/ | Top navigation bar | ✅ Existing (v4.4) |
| **OCEANLAB** | https://sea-plotter-pro.lovable.app/ | Top navigation bar | ✅ New (v4.6) |
\n---

## 2. OCEANLAB Button Integration (New in v4.6)

### 2.1 Button Specifications

| **Property** | **Specification** | **Details** |
|-------------|------------------|-------------|
| **Button Name** | OCEANLAB | Displayed text on button |
| **Button Location** | Main welcome/upload screen (Screenshot 2026-01-27 054253.png) | Top navigation bar |
| **Button Style** | Consistent with platform design | Matches existing UI components |
| **Button Type** | External link button | Opens in new tab/window |
| **Target URL** | https://sea-plotter-pro.lovable.app/ | Sea Plotter Pro platform |
| **Click Action** | Redirect to external URL | Opens Sea Plotter Pro platform |
| **Accessibility** | Keyboard navigable, screen reader compatible | WCAG 2.1 AA compliant |

### 2.2 Button Placement

| **Location** | **Pros** | **Cons** | **Recommendation** |
|-------------|---------|---------|-------------------|
| **Top Navigation Bar (next to existing buttons)** | High visibility, easy access, consistent with existing buttons | May crowd navigation area | ✅ Recommended |
| **Below Welcome Message** | Prominent placement, contextual | May interfere with upload area | Alternative |
| **Bottom Right Corner (floating)** | Always visible, non-intrusive | Less prominent | Alternative |
| **Above Upload Area** | Contextual placement | May distract from primary action | Not recommended |

**Final Recommendation**: Add OCEANLAB button in the top navigation bar, positioned to the left of the 2D/3D Plots button, maintaining consistent spacing and styling.\n
### 2.3 Button Behavior

| **Action** | **Behavior** | **Implementation** |
|-----------|-------------|-------------------|
| **Click** | Open Sea Plotter Pro platform in new tab | `window.open('https://sea-plotter-pro.lovable.app/', '_blank')` |
| **Hover** | Show tooltip: Navigate to OCEANLAB | CSS hover effect + tooltip |
| **Focus** | Keyboard focus indicator | CSS focus outline |
| **Loading** | No loading state needed | Direct redirect |
| **Error Handling** | If URL fails, show error message | Try-catch with user notification |

### 2.4 Visual Design

**Button Design Specifications**:
\n| **Element** | **Specification** | **Value** |
|------------|------------------|----------|
| **Background Color** | Primary brand color or accent | #2E8B57 (sea green) or custom |
| **Text Color** | High contrast | #FFFFFF (white) |
| **Font Size** | Readable | 14-16px |
| **Padding** | Comfortable click area | 12px 24px |
| **Border Radius** | Rounded corners | 6px |
| **Icon** | Optional ocean/lab icon | 🌊 or custom SVG |
| **Hover Effect** | Slight color change | Darken by 10% |
| **Active State** | Pressed effect | Scale 0.98 |

---\n
## 3. 2D/3D Plots Button Integration (Existing from v4.5)

### 3.1 Button Specifications

| **Property** | **Specification** | **Details** |
|-------------|------------------|-------------|
| **Button Name** | 2D/3D Plots | Displayed text on button |
| **Button Location** | Main welcome/upload screen (Screenshot 2026-01-25 154322.png) | Top navigation bar |
| **Button Style** | Consistent with platform design | Matches existing UI components |\n| **Button Type** | External link button | Opens in new tab/window |
| **Target URL** | https://ocean-explorer-pro.lovable.app/ | Ocean Explorer Pro platform |
| **Click Action** | Redirect to external URL | Opens Ocean Explorer Pro platform |
| **Accessibility** | Keyboard navigable, screen reader compatible | WCAG 2.1 AA compliant |
\n### 3.2 Button Placement

| **Location** | **Pros** | **Cons** | **Recommendation** |
|-------------|---------|---------|-------------------|
| **Top Navigation Bar (next to JNEXA AI button)** | High visibility, easy access, consistent with existing button | May crowd navigation area | ✅ Recommended |
| **Below Welcome Message** | Prominent placement, contextual | May interfere with upload area | Alternative |
| **Bottom Right Corner (floating)** | Always visible, non-intrusive | Less prominent | Alternative |\n| **Above Upload Area** | Contextual placement | May distract from primary action | Not recommended |\n
**Final Recommendation**: Add 2D/3D Plots button in the top navigation bar, positioned to the left of the JNEXA AI button, maintaining consistent spacing and styling.

### 3.3 Button Behavior\n
| **Action** | **Behavior** | **Implementation** |
|-----------|-------------|-------------------|
| **Click** | Open Ocean Explorer Pro platform in new tab | `window.open('https://ocean-explorer-pro.lovable.app/', '_blank')` |
| **Hover** | Show tooltip: Navigate to 2D/3D Plots | CSS hover effect + tooltip |
| **Focus** | Keyboard focus indicator | CSS focus outline |
| **Loading** | No loading state needed | Direct redirect |
| **Error Handling** | If URL fails, show error message | Try-catch with user notification |

### 3.4 Visual Design

**Button Design Specifications**:

| **Element** | **Specification** | **Value** |
|------------|------------------|----------|
| **Background Color** | Primary brand color or accent | #4A90E2 (blue) or custom |
| **Text Color** | High contrast | #FFFFFF (white) |
| **Font Size** | Readable | 14-16px |\n| **Padding** | Comfortable click area | 12px 24px |
| **Border Radius** | Rounded corners | 6px |
| **Icon** | Optional chart/plot icon | 📊 or custom SVG |
| **Hover Effect** | Slight color change | Darken by 10% |
| **Active State** | Pressed effect | Scale 0.98 |

---

## 4. JNEXA AI Button Integration (Existing from v4.4)

### 4.1 Button Specifications
\n| **Property** | **Specification** | **Details** |\n|-------------|------------------|-------------|\n| **Button Name** | JNEXA AI | Displayed text on button |
| **Button Location** | Main welcome/upload screen (Screenshot 2026-01-16 165902.png) | Positioned on the screen showing Welcome to ISRO Oceanography Viz |
| **Button Style** | Consistent with platform design | Matches existing UI components |
| **Button Type** | External link button | Opens in new tab/window |
| **Target URL** | https://veda-wise-mind.lovable.app/ | JNEXA AI platform |
| **Click Action** | Redirect to external URL | Opens JNEXA AI platform |
| **Accessibility** | Keyboard navigable, screen reader compatible | WCAG 2.1 AA compliant |

### 4.2 Button Placement Options

| **Location** | **Pros** | **Cons** | **Recommendation** |
|-------------|---------|---------|-------------------|
| **Top Navigation Bar (next to Upload Dataset)** | High visibility, easy access | May crowd existing buttons | ✅ Recommended |
| **Below Welcome Message** | Prominent placement, contextual | May interfere with upload area | Alternative |
| **Bottom Right Corner (floating)** | Always visible, non-intrusive | Less prominent | Alternative |
| **Above Upload Area** | Contextual placement | May distract from primary action | Not recommended |

**Final Recommendation**: Add JNEXA AI button in the top navigation bar, positioned to the left of the Upload Dataset button, maintaining consistent spacing and styling.\n
### 4.3 Button Behavior

| **Action** | **Behavior** | **Implementation** |
|-----------|-------------|-------------------|\n| **Click** | Open JNEXA AI platform in new tab | `window.open('https://veda-wise-mind.lovable.app/', '_blank')` |
| **Hover** | Show tooltip: Navigate to JNEXA AI | CSS hover effect + tooltip |
| **Focus** | Keyboard focus indicator | CSS focus outline |
| **Loading** | No loading state needed | Direct redirect |
| **Error Handling** | If URL fails, show error message | Try-catch with user notification |

### 4.4 Visual Design
\n**Button Design Specifications**:\n
| **Element** | **Specification** | **Value** |
|------------|------------------|----------|
| **Background Color** | Primary brand color or accent | #FF6B35 (orange) or custom |\n| **Text Color** | High contrast | #FFFFFF (white) |
| **Font Size** | Readable | 14-16px |
| **Padding** | Comfortable click area | 12px 24px |
| **Border Radius** | Rounded corners | 6px |\n| **Icon** | Optional AI icon | 🤖 or custom SVG |
| **Hover Effect** | Slight color change | Darken by 10% |
| **Active State** | Pressed effect | Scale 0.98 |
\n---

## 5. Integration with Existing UI (Updated for v4.6)

### 5.1 Screen Layout Update

**Based on Screenshot 2026-01-27 054253.png**:
\n| **Current Element** | **Position** | **New Element** | **Position** |
|-------------------|-------------|----------------|-------------|
| **ISRO Logo** | Top left | **ISRO Logo** | Top left (unchanged) |
| **Upload Dataset Button** | Top right | **OCEANLAB Button** | Top right (new - leftmost) |
| **N/A** | N/A | **2D/3D Plots Button** | Top right (existing - second from left) |
| **N/A** | N/A | **JNEXA AI Button** | Top right (existing - third from left) |
| **N/A** | N/A | **Upload Dataset Button** | Top right (shifted right) |
| **Welcome Message** | Center | **Welcome Message** | Center (unchanged) |
| **Upload Area** | Center | **Upload Area** | Center (unchanged) |

**Recommended Placement**: Add OCEANLAB button in the top navigation bar, positioned to the left of the 2D/3D Plots button, with consistent spacing.\n
### 5.2 Responsive Design

| **Screen Size** | **Button Display** | **Behavior** |
|----------------|-------------------|-------------|
| **Desktop (>1200px)** | Full buttons with text | All three buttons visible in navigation bar |
| **Tablet (768-1200px)** | Full buttons with text | All three buttons visible in navigation bar |
| **Mobile (<768px)** | Icon only or hamburger menu | All three buttons collapsed into mobile menu |

### 5.3 Navigation Flow

**User Journey**:
\n| **Step** | **Action** | **Result** |
|---------|-----------|------------|
| **1** | User lands on main welcome/upload screen | Sees OCEANLAB, 2D/3D Plots, and JNEXA AI buttons in top navigation |
| **2** | User clicks OCEANLAB button | New tab opens with Sea Plotter Pro platform |
| **3** | User interacts with Sea Plotter Pro | External platform functionality |
| **4** | User returns to main platform | Original tab remains open |
| **5** | User clicks 2D/3D Plots button | New tab opens with Ocean Explorer Pro platform |
| **6** | User interacts with Ocean Explorer Pro | External platform functionality |\n| **7** | User returns to main platform | Original tab remains open |
| **8** | User clicks JNEXA AI button | New tab opens with JNEXA AI platform |
| **9** | User interacts with JNEXA AI | External platform functionality |
| **10** | User returns to main platform | Original tab remains open |\n
---

## 6. Technical Implementation

### 6.1 Frontend Code

**React Component Example for OCEANLAB Button**:
\n```jsx
<button
  onClick={() => window.open('https://sea-plotter-pro.lovable.app/', '_blank')}
  className=\"oceanlab-button\"
  aria-label=\"Navigate to OCEANLAB platform\"
>
  OCEANLAB
</button>
```

**React Component Example for 2D/3D Plots Button**:
\n```jsx
<button\n  onClick={() => window.open('https://ocean-explorer-pro.lovable.app/', '_blank')}
  className=\"plots-button\"
  aria-label=\"Navigate to 2D/3D Plots platform\"
>
  2D/3D Plots
</button>
```

**React Component Example for JNEXA AI Button**:

```jsx
<button
  onClick={() => window.open('https://veda-wise-mind.lovable.app/', '_blank')}
  className=\"jnexa-ai-button\"
  aria-label=\"Navigate to JNEXA AI platform\"
>
  JNEXA AI
</button>
```

**CSS Styling for OCEANLAB Button**:

```css
.oceanlab-button {
  background-color: #2E8B57;
  color: #FFFFFF;
  padding: 12px 24px;\n  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  margin-right: 12px;
}\n
.oceanlab-button:hover {
  background-color: #257046;
  transform: translateY(-2px);
}
\n.oceanlab-button:active {
  transform: scale(0.98);
}\n```

**CSS Styling for 2D/3D Plots Button**:

```css
.plots-button {
  background-color: #4A90E2;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;\n  margin-right: 12px;
}

.plots-button:hover {
  background-color: #3A7BC8;
  transform: translateY(-2px);
}

.plots-button:active {
  transform: scale(0.98);
}
```

**CSS Styling for JNEXA AI Button**:

```css
.jnexa-ai-button {
  background-color: #FF6B35;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;\n  margin-right: 12px;
}

.jnexa-ai-button:hover {
  background-color: #E55A2B;
  transform: translateY(-2px);
}

.jnexa-ai-button:active {
  transform: scale(0.98);
}
```
\n### 6.2 Security Considerations

| **Security Aspect** | **Implementation** | **Purpose** |
|-------------------|-------------------|------------|
| **rel=noopener noreferrer** | Add to link attributes | Prevent tabnabbing attacks |
| **HTTPS Verification** | Ensure target URLs use HTTPS | Secure connection |
| **URL Validation** | Validate URL format | Prevent malicious redirects |
| **CSP Headers** | Configure Content Security Policy | Allow external navigation |

### 6.3 Analytics Tracking

**Track Button Usage**:

| **Event** | **Tracking Method** | **Data Collected** |
|----------|-------------------|-------------------|
| **OCEANLAB Button Click** | Google Analytics / Custom analytics | Click count, timestamp, user ID |
| **2D/3D Plots Button Click** | Google Analytics / Custom analytics | Click count, timestamp, user ID |
| **JNEXA AI Button Click** | Google Analytics / Custom analytics | Click count, timestamp, user ID |
| **External Navigation** | Event tracking | Destination URL, referrer |
| **User Return** | Session tracking | Time spent on external platform |

---\n
## 7. Testing Requirements

### 7.1 Functional Testing

| **Test Case** | **Expected Result** | **Status** |
|--------------|-------------------|------------|
| **Click OCEANLAB button** | Opens Sea Plotter Pro in new tab | ✅ To be tested |
| **Click 2D/3D Plots button** | Opens Ocean Explorer Pro in new tab | ✅ To be tested |
| **Click JNEXA AI button** | Opens JNEXA AI in new tab | ✅ To be tested |
| **URL correctness (OCEANLAB)** | Navigates to https://sea-plotter-pro.lovable.app/ | ✅ To be tested |
| **URL correctness (2D/3D Plots)** | Navigates to https://ocean-explorer-pro.lovable.app/ | ✅ To be tested |
| **URL correctness (JNEXA AI)** | Navigates to https://veda-wise-mind.lovable.app/ | ✅ To be tested |
| **Multiple clicks** | Each click opens new tab | ✅ To be tested |
| **Keyboard navigation** | All buttons accessible via Tab key | ✅ To be tested |
| **Screen reader** | All buttons announced correctly | ✅ To be tested |

### 7.2 Cross-Browser Testing

| **Browser** | **Version** | **Test Status** |
|------------|------------|----------------|
| **Chrome** | Latest | ✅ To be tested |
| **Firefox** | Latest | ✅ To be tested |
| **Safari** | Latest | ✅ To be tested |
| **Edge** | Latest | ✅ To be tested |
| **Mobile Safari** | iOS 15+ | ✅ To be tested |
| **Chrome Mobile** | Android 10+ | ✅ To be tested |
\n### 7.3 Performance Testing

| **Metric** | **Target** | **Measurement** |
|-----------|-----------|----------------|
| **Button Render Time** | <100ms | Time to interactive |
| **Click Response** | <50ms | Event handler execution |
| **Page Load Impact** | <10ms | Additional load time |
\n---

## 8. Documentation Updates

### 8.1 User Guide

**New Section: External Platform Integration**

- Description of OCEANLAB button functionality
- Description of 2D/3D Plots button functionality
- Description of JNEXA AI button functionality\n- Instructions on how to access Sea Plotter Pro platform
- Instructions on how to access Ocean Explorer Pro platform
- Instructions on how to access JNEXA AI platform\n- Explanation of platform capabilities
- Return navigation instructions

### 8.2 Developer Documentation

**Technical Documentation Updates**:\n
- Component structure for all external navigation buttons
- Styling guidelines\n- Event handling implementation
- Security best practices
\n---

## 9. Rollout Plan

### 9.1 Deployment Timeline

| **Phase** | **Duration** | **Activities** |
|----------|-------------|---------------|
| **Development** | 1 day | Implement OCEANLAB button component |
| **Testing** | 1 day | Functional and cross-browser testing |
| **Staging** | 1 day | Deploy to staging environment |
| **Production** | 1 day | Deploy to production |
| **Monitoring** | Ongoing | Track usage and issues |

### 9.2 Success Metrics

| **Metric** | **Target** | **Measurement Period** |
|-----------|-----------|----------------------|
| **OCEANLAB Button Click Rate** | >10% of users | First week |
| **2D/3D Plots Button Click Rate** | >10% of users | First week |
| **JNEXA AI Button Click Rate** | >10% of users | First week |
| **Error Rate** | <1% | First week |
| **User Feedback** | >4.0/5.0 rating | First month |
| **Return Rate** | >80% users return | First month |

---

## Summary - Button Integration (v4.6)

**✅ NEW IN v4.6**: OCEANLAB button added on the main welcome/upload screen (Screenshot 2026-01-27 054253.png)

**Key Features**:
\n✅ **OCEANLAB Button** (New in v4.6):
- Button Name: OCEANLAB
- Target URL: https://sea-plotter-pro.lovable.app/
- Click Action: Opens in new tab
- Location: Top navigation bar, left of 2D/3D Plots button (on main welcome/upload screen)
- Design: Consistent with platform UI
- Accessibility: Keyboard navigable, screen reader compatible\n
✅ **2D/3D Plots Button** (Existing from v4.5):
- Button Name: 2D/3D Plots\n- Target URL: https://ocean-explorer-pro.lovable.app/
- Click Action: Opens in new tab
- Location: Top navigation bar, left of JNEXA AI button (on main welcome/upload screen)
- Design: Consistent with platform UI
- Accessibility: Keyboard navigable, screen reader compatible

✅ **JNEXA AI Button** (Existing from v4.4):
- Button Name: JNEXA AI
- Target URL: https://veda-wise-mind.lovable.app/
- Click Action: Opens in new tab
- Location: Top navigation bar, left of Upload Dataset button (on main welcome/upload screen)\n- Design: Consistent with platform UI
- Accessibility: Keyboard navigable, screen reader compatible\n
✅ **Security**: Implements noopener noreferrer, HTTPS validation\n✅ **Responsive**: Adapts to desktop, tablet, and mobile screens
✅ **Analytics**: Tracks button usage and user behavior
✅ **Testing**: Comprehensive functional and cross-browser testing
\n**Implementation Details**:
- ✅ React components with onClick handlers
- ✅ Tailwind CSS styling
- ✅ Opens external URLs in new tabs
- ✅ Maintains original tab session
- ✅ No impact on existing functionality

**Deployment Timeline**:
- ✅ Development: 1 day
- ✅ Testing: 1 day
- ✅ Staging: 1 day
- ✅ Production: 1 day
- ✅ Total: 4 days

---

**Document Version**: 4.6 (OCEANLAB Button Addition)
**New Feature**: ✅ OCEANLAB Button\n**Existing Features**: \n- ✅ 2D/3D Plots Button (v4.5)
- ✅ JNEXA AI Button (v4.4)
**Target Screen**: Main welcome/upload screen
**Target URLs**: \n- OCEANLAB: https://sea-plotter-pro.lovable.app/
- 2D/3D Plots: https://ocean-explorer-pro.lovable.app/
- JNEXA AI: https://veda-wise-mind.lovable.app/
**Implementation**: React + Tailwind CSS
**Deployment**: 4-day rollout
**Reference Images**: \n- Screenshot 2026-01-27 054253.png (OCEANLAB button)
- Screenshot 2026-01-25 154322.png (2D/3D Plots button)
- Screenshot 2026-01-16 165902.png (JNEXA AI button)
**Page Count**: 480+
**Table Count**: 320+