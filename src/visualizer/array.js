/**
 * Array Visualizer — the primary visualizer for CodeVisual AI
 *
 * Renders arrays as colourful bars on an HTML5 Canvas and provides
 * step-by-step traces for 8 classic array / sorting algorithms.
 */

/* ================================================================== */
/*  Helper: create a blank step object                                */
/* ================================================================== */
function createStep(data, overrides = {}) {
  return {
    data: [...data],
    highlights: [],
    comparing: [],
    swapping: [],
    sorted: [],
    active: [],
    pointers: {},
    message: '',
    code: '',
    variables: {},
    ...overrides,
  };
}

/* ================================================================== */
/*  1. Traversal                                                      */
/* ================================================================== */
function generateTraversal(inputData) {
  const arr = (inputData && inputData.array) ? [...inputData.array] : [38, 27, 43, 3, 9, 82, 10];
  const steps = [];

  steps.push(createStep(arr, {
    message: 'Starting array traversal',
    code: 'for i in range(len(arr)):',
    variables: {},
  }));

  for (let i = 0; i < arr.length; i++) {
    steps.push(createStep(arr, {
      active: [i],
      highlights: Array.from({ length: i }, (_, k) => k),
      pointers: { i },
      message: `Visiting element at index ${i} → value ${arr[i]}`,
      code: `print(arr[${i}])  # ${arr[i]}`,
      variables: { i, value: arr[i] },
    }));
  }

  steps.push(createStep(arr, {
    highlights: arr.map((_, i) => i),
    message: 'Traversal complete — all elements visited',
    code: '# Done',
    variables: { totalElements: arr.length },
  }));

  return steps;
}

/* ================================================================== */
/*  2. Bubble Sort                                                    */
/* ================================================================== */
function generateBubbleSort(inputData) {
  const arr = (inputData && inputData.array) ? [...inputData.array] : [38, 27, 43, 3, 9, 82, 10];
  const steps = [];
  const n = arr.length;
  const sortedIndices = [];

  steps.push(createStep(arr, {
    message: 'Starting Bubble Sort',
    code: 'for i in range(n):',
    variables: { n },
  }));

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      // Comparing
      steps.push(createStep(arr, {
        comparing: [j, j + 1],
        sorted: [...sortedIndices],
        pointers: { j, 'j+1': j + 1 },
        message: `Comparing arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`,
        code: `if arr[${j}] > arr[${j + 1}]:`,
        variables: { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] },
      }));

      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push(createStep(arr, {
          swapping: [j, j + 1],
          sorted: [...sortedIndices],
          pointers: { j, 'j+1': j + 1 },
          message: `Swapping ${arr[j + 1]} and ${arr[j]}`,
          code: `arr[${j}], arr[${j + 1}] = arr[${j + 1}], arr[${j}]`,
          variables: { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] },
        }));
      }
    }
    sortedIndices.push(n - 1 - i);
  }
  sortedIndices.push(0);

  steps.push(createStep(arr, {
    sorted: arr.map((_, i) => i),
    message: 'Bubble Sort complete!',
    code: '# Sorted',
    variables: {},
  }));

  return steps;
}

/* ================================================================== */
/*  3. Selection Sort                                                 */
/* ================================================================== */
function generateSelectionSort(inputData) {
  const arr = (inputData && inputData.array) ? [...inputData.array] : [38, 27, 43, 3, 9, 82, 10];
  const steps = [];
  const n = arr.length;
  const sortedIndices = [];

  steps.push(createStep(arr, {
    message: 'Starting Selection Sort',
    code: 'for i in range(n):',
    variables: { n },
  }));

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push(createStep(arr, {
      active: [i],
      sorted: [...sortedIndices],
      pointers: { i, min: minIdx },
      message: `Pass ${i + 1}: finding minimum in unsorted portion [${i}..${n - 1}]`,
      code: `min_idx = ${i}`,
      variables: { i, min_idx: minIdx },
    }));

    for (let j = i + 1; j < n; j++) {
      steps.push(createStep(arr, {
        comparing: [minIdx, j],
        active: [i],
        sorted: [...sortedIndices],
        pointers: { i, min: minIdx, j },
        message: `Comparing arr[${minIdx}]=${arr[minIdx]} with arr[${j}]=${arr[j]}`,
        code: `if arr[${j}] < arr[min_idx]:`,
        variables: { i, j, min_idx: minIdx, 'arr[j]': arr[j], 'arr[min]': arr[minIdx] },
      }));

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push(createStep(arr, {
          active: [minIdx],
          sorted: [...sortedIndices],
          pointers: { i, min: minIdx, j },
          message: `New minimum found: arr[${minIdx}]=${arr[minIdx]}`,
          code: `min_idx = ${j}`,
          variables: { i, j, min_idx: minIdx },
        }));
      }
    }

    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push(createStep(arr, {
        swapping: [i, minIdx],
        sorted: [...sortedIndices],
        pointers: { i, min: minIdx },
        message: `Swapping arr[${i}] and arr[${minIdx}] → placing ${arr[i]} at index ${i}`,
        code: `arr[${i}], arr[${minIdx}] = arr[${minIdx}], arr[${i}]`,
        variables: { i, min_idx: minIdx },
      }));
    }

    sortedIndices.push(i);
  }
  sortedIndices.push(n - 1);

  steps.push(createStep(arr, {
    sorted: arr.map((_, i) => i),
    message: 'Selection Sort complete!',
    code: '# Sorted',
  }));

  return steps;
}

/* ================================================================== */
/*  4. Merge Sort                                                     */
/* ================================================================== */
function generateMergeSort(inputData) {
  const arr = (inputData && inputData.array) ? [...inputData.array] : [38, 27, 43, 3, 9, 82, 10];
  const steps = [];

  steps.push(createStep(arr, {
    message: 'Starting Merge Sort',
    code: 'mergeSort(arr, 0, n-1)',
    variables: { n: arr.length },
  }));

  function mergeSortHelper(a, left, right) {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);

    steps.push(createStep([...a], {
      active: Array.from({ length: right - left + 1 }, (_, k) => left + k),
      pointers: { left, mid, right },
      message: `Dividing: arr[${left}..${right}] → arr[${left}..${mid}] and arr[${mid + 1}..${right}]`,
      code: `mid = (${left} + ${right}) // 2  # mid = ${mid}`,
      variables: { left, right, mid },
    }));

    mergeSortHelper(a, left, mid);
    mergeSortHelper(a, mid + 1, right);

    // Merge phase
    const leftArr = a.slice(left, mid + 1);
    const rightArr = a.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    steps.push(createStep([...a], {
      comparing: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
      pointers: { left, mid, right },
      message: `Merging: [${leftArr}] and [${rightArr}]`,
      code: 'merge(arr, left, mid, right)',
      variables: { leftArr: leftArr.join(','), rightArr: rightArr.join(',') },
    }));

    while (i < leftArr.length && j < rightArr.length) {
      if (leftArr[i] <= rightArr[j]) {
        a[k] = leftArr[i];
        i++;
      } else {
        a[k] = rightArr[j];
        j++;
      }
      k++;

      steps.push(createStep([...a], {
        swapping: [k - 1],
        active: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        pointers: { left, right, k: k - 1 },
        message: `Placed ${a[k - 1]} at index ${k - 1}`,
        code: `arr[${k - 1}] = ${a[k - 1]}`,
        variables: { i, j, k },
      }));
    }

    while (i < leftArr.length) {
      a[k] = leftArr[i];
      i++; k++;
      steps.push(createStep([...a], {
        swapping: [k - 1],
        active: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        pointers: { left, right, k: k - 1 },
        message: `Placed remaining ${a[k - 1]} at index ${k - 1}`,
        code: `arr[${k - 1}] = ${a[k - 1]}`,
        variables: { i, j, k },
      }));
    }

    while (j < rightArr.length) {
      a[k] = rightArr[j];
      j++; k++;
      steps.push(createStep([...a], {
        swapping: [k - 1],
        active: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        pointers: { left, right, k: k - 1 },
        message: `Placed remaining ${a[k - 1]} at index ${k - 1}`,
        code: `arr[${k - 1}] = ${a[k - 1]}`,
        variables: { i, j, k },
      }));
    }
  }

  mergeSortHelper(arr, 0, arr.length - 1);

  steps.push(createStep(arr, {
    sorted: arr.map((_, i) => i),
    message: 'Merge Sort complete!',
    code: '# Sorted',
  }));

  return steps;
}

/* ================================================================== */
/*  5. Quick Sort                                                     */
/* ================================================================== */
function generateQuickSort(inputData) {
  const arr = (inputData && inputData.array) ? [...inputData.array] : [38, 27, 43, 3, 9, 82, 10];
  const steps = [];
  const sortedIndices = new Set();

  steps.push(createStep(arr, {
    message: 'Starting Quick Sort',
    code: 'quickSort(arr, 0, n-1)',
    variables: { n: arr.length },
  }));

  function quickSortHelper(a, low, high) {
    if (low >= high) {
      if (low === high) sortedIndices.add(low);
      return;
    }

    const pivotVal = a[high];

    steps.push(createStep([...a], {
      active: [high],
      highlights: Array.from({ length: high - low + 1 }, (_, k) => low + k),
      sorted: [...sortedIndices],
      pointers: { pivot: high, low, high },
      message: `Partitioning arr[${low}..${high}], pivot = ${pivotVal}`,
      code: `pivot = arr[${high}]  # ${pivotVal}`,
      variables: { low, high, pivot: pivotVal },
    }));

    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push(createStep([...a], {
        comparing: [j, high],
        active: [high],
        sorted: [...sortedIndices],
        pointers: { i: Math.max(i, low), j, pivot: high },
        message: `Comparing arr[${j}]=${a[j]} with pivot ${pivotVal}`,
        code: `if arr[${j}] <= pivot:`,
        variables: { i, j, pivot: pivotVal, 'arr[j]': a[j] },
      }));

      if (a[j] <= pivotVal) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          steps.push(createStep([...a], {
            swapping: [i, j],
            active: [high],
            sorted: [...sortedIndices],
            pointers: { i, j, pivot: high },
            message: `Swapping arr[${i}]=${a[j]} and arr[${j}]=${a[i]}`,
            code: `arr[${i}], arr[${j}] = arr[${j}], arr[${i}]`,
            variables: { i, j },
          }));
        }
      }
    }

    const pivotIdx = i + 1;
    if (pivotIdx !== high) {
      [a[pivotIdx], a[high]] = [a[high], a[pivotIdx]];
    }
    sortedIndices.add(pivotIdx);

    steps.push(createStep([...a], {
      sorted: [...sortedIndices],
      active: [pivotIdx],
      pointers: { pivot: pivotIdx },
      message: `Pivot ${pivotVal} placed at index ${pivotIdx}`,
      code: `arr[${pivotIdx}], arr[${high}] = arr[${high}], arr[${pivotIdx}]`,
      variables: { pivotIndex: pivotIdx },
    }));

    quickSortHelper(a, low, pivotIdx - 1);
    quickSortHelper(a, pivotIdx + 1, high);
  }

  quickSortHelper(arr, 0, arr.length - 1);

  steps.push(createStep(arr, {
    sorted: arr.map((_, i) => i),
    message: 'Quick Sort complete!',
    code: '# Sorted',
  }));

  return steps;
}

/* ================================================================== */
/*  6. Binary Search                                                  */
/* ================================================================== */
function generateBinarySearch(inputData) {
  const arr = (inputData && inputData.array) ? [...inputData.array] : [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const target = (inputData && inputData.target !== undefined) ? inputData.target : 23;
  const steps = [];

  steps.push(createStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Binary Search for target = ${target}`,
    code: 'left, right = 0, n-1',
    variables: { target, n: arr.length },
  }));

  let left = 0;
  let right = arr.length - 1;
  let found = false;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push(createStep(arr, {
      active: [mid],
      highlights: Array.from({ length: right - left + 1 }, (_, k) => left + k),
      sorted: arr.map((_, i) => i),
      pointers: { left, mid, right },
      message: `Checking mid = ${mid}, arr[${mid}] = ${arr[mid]}`,
      code: `mid = (${left} + ${right}) // 2  # ${mid}`,
      variables: { left, right, mid, 'arr[mid]': arr[mid], target },
    }));

    if (arr[mid] === target) {
      found = true;
      steps.push(createStep(arr, {
        active: [mid],
        sorted: arr.map((_, i) => i),
        highlights: [mid],
        pointers: { found: mid },
        message: `Found target ${target} at index ${mid}!`,
        code: `return ${mid}  # Found!`,
        variables: { left, right, mid, target },
      }));
      break;
    } else if (arr[mid] < target) {
      steps.push(createStep(arr, {
        comparing: [mid],
        sorted: arr.map((_, i) => i),
        highlights: Array.from({ length: right - mid }, (_, k) => mid + 1 + k),
        pointers: { left: mid + 1, right },
        message: `arr[${mid}]=${arr[mid]} < ${target} → search right half`,
        code: `left = mid + 1  # ${mid + 1}`,
        variables: { left: mid + 1, right, mid, target },
      }));
      left = mid + 1;
    } else {
      steps.push(createStep(arr, {
        comparing: [mid],
        sorted: arr.map((_, i) => i),
        highlights: Array.from({ length: mid - left }, (_, k) => left + k),
        pointers: { left, right: mid - 1 },
        message: `arr[${mid}]=${arr[mid]} > ${target} → search left half`,
        code: `right = mid - 1  # ${mid - 1}`,
        variables: { left, right: mid - 1, mid, target },
      }));
      right = mid - 1;
    }
  }

  if (!found) {
    steps.push(createStep(arr, {
      sorted: arr.map((_, i) => i),
      message: `Target ${target} not found in the array`,
      code: 'return -1  # Not found',
      variables: { target },
    }));
  }

  return steps;
}

/* ================================================================== */
/*  7. Two Pointer                                                    */
/* ================================================================== */
function generateTwoPointer(inputData) {
  const arr = (inputData && inputData.array) ? [...inputData.array] : [2, 7, 11, 15, 19, 23, 28];
  const target = (inputData && inputData.target !== undefined) ? inputData.target : 30;
  const steps = [];

  steps.push(createStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Two Pointer: Find pair summing to ${target}`,
    code: 'left, right = 0, n-1',
    variables: { target, n: arr.length },
  }));

  let left = 0;
  let right = arr.length - 1;
  let found = false;

  while (left < right) {
    const sum = arr[left] + arr[right];

    steps.push(createStep(arr, {
      comparing: [left, right],
      sorted: arr.map((_, i) => i),
      pointers: { left, right },
      message: `arr[${left}]+arr[${right}] = ${arr[left]}+${arr[right]} = ${sum} (target=${target})`,
      code: `sum = arr[${left}] + arr[${right}]  # ${sum}`,
      variables: { left, right, sum, target, 'arr[left]': arr[left], 'arr[right]': arr[right] },
    }));

    if (sum === target) {
      found = true;
      steps.push(createStep(arr, {
        active: [left, right],
        sorted: arr.map((_, i) => i),
        pointers: { left, right },
        message: `Found pair! arr[${left}]=${arr[left]} + arr[${right}]=${arr[right]} = ${target}`,
        code: `return (${left}, ${right})  # Found!`,
        variables: { left, right, sum, target },
      }));
      break;
    } else if (sum < target) {
      steps.push(createStep(arr, {
        highlights: [left],
        sorted: arr.map((_, i) => i),
        pointers: { left: left + 1, right },
        message: `Sum ${sum} < ${target} → move left pointer right`,
        code: `left += 1  # ${left + 1}`,
        variables: { left: left + 1, right, target },
      }));
      left++;
    } else {
      steps.push(createStep(arr, {
        highlights: [right],
        sorted: arr.map((_, i) => i),
        pointers: { left, right: right - 1 },
        message: `Sum ${sum} > ${target} → move right pointer left`,
        code: `right -= 1  # ${right - 1}`,
        variables: { left, right: right - 1, target },
      }));
      right--;
    }
  }

  if (!found) {
    steps.push(createStep(arr, {
      sorted: arr.map((_, i) => i),
      message: `No pair found summing to ${target}`,
      code: 'return None',
      variables: { target },
    }));
  }

  return steps;
}

/* ================================================================== */
/*  8. Sliding Window                                                 */
/* ================================================================== */
function generateSlidingWindow(inputData) {
  const arr = (inputData && inputData.array) ? [...inputData.array] : [2, 1, 5, 1, 3, 2, 8, 4];
  const k = (inputData && inputData.k !== undefined) ? inputData.k : 3;
  const steps = [];

  steps.push(createStep(arr, {
    message: `Sliding Window: Max sum of subarray with size k=${k}`,
    code: 'windowSum = sum(arr[0:k])',
    variables: { k, n: arr.length },
  }));

  // Initial window
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  let maxSum = windowSum;
  let maxStart = 0;

  const windowIndices = Array.from({ length: k }, (_, i) => i);

  steps.push(createStep(arr, {
    active: windowIndices,
    pointers: { windowStart: 0, windowEnd: k - 1 },
    message: `Initial window [0..${k - 1}]: sum = ${windowSum}`,
    code: `windowSum = ${windowSum}`,
    variables: { windowSum, maxSum, windowStart: 0, windowEnd: k - 1 },
  }));

  // Slide the window
  for (let i = k; i < arr.length; i++) {
    const removing = arr[i - k];
    const adding = arr[i];
    windowSum = windowSum - removing + adding;

    const curWindow = Array.from({ length: k }, (_, j) => i - k + 1 + j);

    steps.push(createStep(arr, {
      active: curWindow,
      swapping: [i - k], // element leaving
      highlights: [i],   // element entering
      pointers: { windowStart: i - k + 1, windowEnd: i },
      message: `Slide: remove arr[${i - k}]=${removing}, add arr[${i}]=${adding} → sum = ${windowSum}`,
      code: `windowSum = ${windowSum + removing} - ${removing} + ${adding}  # ${windowSum}`,
      variables: { windowSum, maxSum, removing, adding, windowStart: i - k + 1, windowEnd: i },
    }));

    if (windowSum > maxSum) {
      maxSum = windowSum;
      maxStart = i - k + 1;

      steps.push(createStep(arr, {
        active: curWindow,
        sorted: curWindow, // reuse green for "best window"
        pointers: { windowStart: i - k + 1, windowEnd: i },
        message: `New maximum sum = ${maxSum} found at window [${maxStart}..${maxStart + k - 1}]`,
        code: `maxSum = ${maxSum}`,
        variables: { windowSum, maxSum, maxStart },
      }));
    }
  }

  const bestWindow = Array.from({ length: k }, (_, j) => maxStart + j);
  steps.push(createStep(arr, {
    sorted: bestWindow,
    pointers: { windowStart: maxStart, windowEnd: maxStart + k - 1 },
    message: `Maximum sum = ${maxSum} at window [${maxStart}..${maxStart + k - 1}]`,
    code: `return ${maxSum}`,
    variables: { maxSum, maxStart },
  }));

  return steps;
}

/* ================================================================== */
/*  Render function                                                   */
/* ================================================================== */
function renderArray(ctx, step, w, h, meta = {}) {
  ctx.clearRect(0, 0, w, h);
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const data = step.data;
  if (!data || data.length === 0) return;

  const n = data.length;
  const padding = { top: 60, bottom: 60, left: 40, right: 40 };
  const areaW = w - padding.left - padding.right;
  const areaH = h - padding.top - padding.bottom;
  const gap = Math.max(2, Math.min(6, areaW / n * 0.1));
  const barW = (areaW - gap * (n - 1)) / n;
  const maxVal = Math.max(...data, 1);

  // ── colour helpers ─────────────────────────────────────────────
  function barColor(index) {
    if (step.swapping && step.swapping.includes(index)) return '#f97316';
    if (step.comparing && step.comparing.includes(index)) return '#fbbf24';
    if (step.sorted && step.sorted.includes(index)) return '#10b981';
    if (step.active && step.active.includes(index)) return '#06b6d4';
    if (step.highlights && step.highlights.includes(index)) return '#a78bfa';
    return null; // default gradient
  }

  // ── draw bars ──────────────────────────────────────────────────
  for (let i = 0; i < n; i++) {
    const x = padding.left + i * (barW + gap);
    const barH = (data[i] / maxVal) * (areaH - 20);
    const y = padding.top + areaH - barH;
    const color = barColor(i);
    const radius = Math.min(4, barW / 4);

    // shadow / glow for highlighted bars
    if (color && color !== '#a78bfa') {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // fill
    if (color) {
      ctx.fillStyle = color;
    } else {
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, '#667eea');
      grad.addColorStop(1, '#764ba2');
      ctx.fillStyle = grad;
    }

    // rounded rect
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + barW - radius, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
    ctx.lineTo(x + barW, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    if (color && color !== '#a78bfa') {
      ctx.restore();
    }

    // value label above bar
    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
    ctx.font = `bold ${Math.min(14, barW * 0.45)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(String(data[i]), x + barW / 2, y - 4);

    // index label below bar
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.6)';
    ctx.font = `${Math.min(11, barW * 0.35)}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(String(i), x + barW / 2, padding.top + areaH + 4);
  }

  // ── draw pointers ──────────────────────────────────────────────
  if (step.pointers) {
    const pointerColors = {
      i: '#06b6d4', j: '#fbbf24', 'j+1': '#f97316',
      left: '#10b981', right: '#ef4444', mid: '#a78bfa',
      min: '#f97316', pivot: '#ec4899', k: '#06b6d4',
      windowStart: '#10b981', windowEnd: '#ef4444',
      found: '#22d3ee', low: '#10b981', high: '#ef4444',
    };

    const pointerEntries = Object.entries(step.pointers);
    const indexToPointers = {};
    for (const [label, idx] of pointerEntries) {
      if (idx === undefined || idx === null || idx < 0 || idx >= n) continue;
      if (!indexToPointers[idx]) indexToPointers[idx] = [];
      indexToPointers[idx].push(label);
    }

    for (const [idxStr, labels] of Object.entries(indexToPointers)) {
      const idx = parseInt(idxStr);
      const x = padding.left + idx * (barW + gap) + barW / 2;
      
      labels.forEach((label, stackIndex) => {
        const yOffset = stackIndex * 24;
        const yArrow = padding.top - 6 - yOffset;
        const col = pointerColors[label] || (isDark ? '#cbd5e1' : '#334155');

        // triangle
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(x, yArrow);
        ctx.lineTo(x - 6, yArrow - 12);
        ctx.lineTo(x + 6, yArrow - 12);
        ctx.closePath();
        ctx.fill();

        // label
        ctx.fillStyle = col;
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, x, yArrow - 14);
      });
    }
  }

  // ── message ────────────────────────────────────────────────────
  if (step.message) {
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)';
    ctx.font = '13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(step.message, w / 2, h - 10);
  }
}

/* ================================================================== */
/*  Export                                                            */
/* ================================================================== */
export const arrayVisualizer = {
  name: 'Array',
  operations: [
    'Traversal',
    'Bubble Sort',
    'Selection Sort',
    'Merge Sort',
    'Quick Sort',
    'Binary Search',
    'Two Pointer',
    'Sliding Window',
  ],

  generateSteps(operation, inputData) {
    const generators = {
      'Traversal': generateTraversal,
      'Bubble Sort': generateBubbleSort,
      'Selection Sort': generateSelectionSort,
      'Merge Sort': generateMergeSort,
      'Quick Sort': generateQuickSort,
      'Binary Search': generateBinarySearch,
      'Two Pointer': generateTwoPointer,
      'Sliding Window': generateSlidingWindow,
    };
    const gen = generators[operation];
    if (!gen) throw new Error(`Unknown operation: ${operation}`);
    return gen(inputData);
  },

  render: renderArray,
};
