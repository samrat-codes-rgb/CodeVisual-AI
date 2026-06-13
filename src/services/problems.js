import { store } from '../store.js';

// Compact problem database — 50 problems with full 4-language solutions
const PROBLEMS = [
  {
    id: "two-sum", title: "Two Sum", difficulty: "easy", source: "leetcode", number: 1,
    topics: ["arrays", "hash-table"], companies: ["Google","Amazon","Meta"],
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" }],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists"],
    solutions: {
      python: { brute: `def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]`, optimal: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i` },
      javascript: { brute: `function twoSum(nums, target) {\n    for (let i = 0; i < nums.length; i++)\n        for (let j = i+1; j < nums.length; j++)\n            if (nums[i] + nums[j] === target) return [i, j];\n}`, optimal: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return [map.get(comp), i];\n        map.set(nums[i], i);\n    }\n}` },
      java: { brute: `public int[] twoSum(int[] nums, int target) {\n    for (int i = 0; i < nums.length; i++)\n        for (int j = i+1; j < nums.length; j++)\n            if (nums[i]+nums[j]==target) return new int[]{i,j};\n    return new int[]{};\n}`, optimal: `public int[] twoSum(int[] nums, int target) {\n    Map<Integer,Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int comp = target - nums[i];\n        if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}` },
      cpp: { brute: `vector<int> twoSum(vector<int>& nums, int target) {\n    for (int i=0;i<nums.size();i++)\n        for (int j=i+1;j<nums.size();j++)\n            if (nums[i]+nums[j]==target) return {i,j};\n    return {};\n}`, optimal: `vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int,int> mp;\n    for (int i=0;i<nums.size();i++) {\n        int c=target-nums[i];\n        if (mp.count(c)) return {mp[c],i};\n        mp[nums[i]]=i;\n    }\n    return {};\n}` }
    },
    complexity: { brute: { time: "O(n²)", space: "O(1)" }, optimal: { time: "O(n)", space: "O(n)" } },
    hints: ["What value do you need to find for each element?", "Can a hash map help check complements in O(1)?"]
  },
  {
    id: "valid-parentheses", title: "Valid Parentheses", difficulty: "easy", source: "leetcode", number: 20,
    topics: ["stack", "strings"], companies: ["Amazon","Google","Microsoft"],
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
    examples: [{ input: 's = "()[]{}"', output: "true", explanation: "All brackets properly matched" }],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only"],
    solutions: {
      python: { brute: `def isValid(s):\n    while '()' in s or '{}' in s or '[]' in s:\n        s = s.replace('()','').replace('{}','').replace('[]','')\n    return s == ''`, optimal: `def isValid(s):\n    stack = []\n    mapping = {')':'(', '}':'{', ']':'['}\n    for ch in s:\n        if ch in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[ch] != top: return False\n        else:\n            stack.append(ch)\n    return not stack` },
      javascript: { brute: `function isValid(s) {\n    while (s.includes('()') || s.includes('{}') || s.includes('[]'))\n        s = s.replace('()','').replace('{}','').replace('[]','');\n    return s === '';\n}`, optimal: `function isValid(s) {\n    const stack = [], map = {')':'(','}':'{',']':'['};\n    for (const c of s) {\n        if (map[c]) { if (stack.pop() !== map[c]) return false; }\n        else stack.push(c);\n    }\n    return stack.length === 0;\n}` },
      java: { brute: `public boolean isValid(String s) {\n    while (s.contains("()") || s.contains("{}") || s.contains("[]"))\n        s = s.replace("()","").replace("{}","").replace("[]","");\n    return s.isEmpty();\n}`, optimal: `public boolean isValid(String s) {\n    Stack<Character> st = new Stack<>();\n    for (char c : s.toCharArray()) {\n        if (c=='(') st.push(')');\n        else if (c=='{') st.push('}');\n        else if (c=='[') st.push(']');\n        else if (st.isEmpty() || st.pop()!=c) return false;\n    }\n    return st.isEmpty();\n}` },
      cpp: { brute: `bool isValid(string s) {\n    while (s.find("()")!=string::npos||s.find("{}")!=string::npos||s.find("[]")!=string::npos) {\n        for (auto p:{"()","{}","[]"}) { size_t pos; while((pos=s.find(p))!=string::npos) s.erase(pos,2); }\n    }\n    return s.empty();\n}`, optimal: `bool isValid(string s) {\n    stack<char> st;\n    for (char c:s) {\n        if (c=='('||c=='{'||c=='[') st.push(c);\n        else {\n            if (st.empty()) return false;\n            char t=st.top(); st.pop();\n            if ((c==')'&&t!='(')||(c=='}'&&t!='{')||(c==']'&&t!='[')) return false;\n        }\n    }\n    return st.empty();\n}` }
    },
    complexity: { brute: { time: "O(n²)", space: "O(n)" }, optimal: { time: "O(n)", space: "O(n)" } },
    hints: ["Use a stack to track opening brackets", "When you see a closing bracket, check if it matches the top of the stack"]
  },
  {
    id: "maximum-subarray", title: "Maximum Subarray", difficulty: "medium", source: "leetcode", number: 53,
    topics: ["arrays", "dynamic-programming"], companies: ["Amazon","Microsoft","Google"],
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "Subarray [4,-1,2,1] has largest sum 6" }],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    solutions: {
      python: { brute: `def maxSubArray(nums):\n    max_sum = float('-inf')\n    for i in range(len(nums)):\n        curr = 0\n        for j in range(i, len(nums)):\n            curr += nums[j]\n            max_sum = max(max_sum, curr)\n    return max_sum`, optimal: `def maxSubArray(nums):\n    max_sum = curr = nums[0]\n    for num in nums[1:]:\n        curr = max(num, curr + num)\n        max_sum = max(max_sum, curr)\n    return max_sum` },
      javascript: { brute: `function maxSubArray(nums) {\n    let max = -Infinity;\n    for (let i = 0; i < nums.length; i++) {\n        let curr = 0;\n        for (let j = i; j < nums.length; j++) {\n            curr += nums[j];\n            max = Math.max(max, curr);\n        }\n    }\n    return max;\n}`, optimal: `function maxSubArray(nums) {\n    let max = nums[0], curr = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        max = Math.max(max, curr);\n    }\n    return max;\n}` },
      java: { brute: `public int maxSubArray(int[] nums) {\n    int max = Integer.MIN_VALUE;\n    for (int i=0;i<nums.length;i++) {\n        int curr=0;\n        for (int j=i;j<nums.length;j++) { curr+=nums[j]; max=Math.max(max,curr); }\n    }\n    return max;\n}`, optimal: `public int maxSubArray(int[] nums) {\n    int max=nums[0], curr=nums[0];\n    for (int i=1;i<nums.length;i++) {\n        curr=Math.max(nums[i], curr+nums[i]);\n        max=Math.max(max, curr);\n    }\n    return max;\n}` },
      cpp: { brute: `int maxSubArray(vector<int>& nums) {\n    int mx=INT_MIN;\n    for(int i=0;i<nums.size();i++){int c=0;for(int j=i;j<nums.size();j++){c+=nums[j];mx=max(mx,c);}}\n    return mx;\n}`, optimal: `int maxSubArray(vector<int>& nums) {\n    int mx=nums[0],curr=nums[0];\n    for(int i=1;i<nums.size();i++){curr=max(nums[i],curr+nums[i]);mx=max(mx,curr);}\n    return mx;\n}` }
    },
    complexity: { brute: { time: "O(n²)", space: "O(1)" }, optimal: { time: "O(n)", space: "O(1)" } },
    hints: ["Kadane's algorithm: at each position, should we start fresh or extend current subarray?", "If current sum becomes negative, reset it to 0"]
  },
  {
    id: "climbing-stairs", title: "Climbing Stairs", difficulty: "easy", source: "leetcode", number: 70,
    topics: ["dynamic-programming", "recursion"], companies: ["Amazon","Google","Adobe"],
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [{ input: "n = 5", output: "8", explanation: "8 distinct ways to climb 5 stairs" }],
    constraints: ["1 <= n <= 45"],
    solutions: {
      python: { brute: `def climbStairs(n):\n    if n <= 1: return 1\n    return climbStairs(n-1) + climbStairs(n-2)`, optimal: `def climbStairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n+1):\n        a, b = b, a + b\n    return b` },
      javascript: { brute: `function climbStairs(n) {\n    if (n <= 1) return 1;\n    return climbStairs(n-1) + climbStairs(n-2);\n}`, optimal: `function climbStairs(n) {\n    if (n <= 2) return n;\n    let a = 1, b = 2;\n    for (let i = 3; i <= n; i++) [a, b] = [b, a + b];\n    return b;\n}` },
      java: { brute: `public int climbStairs(int n) {\n    if (n<=1) return 1;\n    return climbStairs(n-1)+climbStairs(n-2);\n}`, optimal: `public int climbStairs(int n) {\n    if (n<=2) return n;\n    int a=1,b=2;\n    for(int i=3;i<=n;i++){int c=a+b;a=b;b=c;}\n    return b;\n}` },
      cpp: { brute: `int climbStairs(int n) {\n    if(n<=1) return 1;\n    return climbStairs(n-1)+climbStairs(n-2);\n}`, optimal: `int climbStairs(int n) {\n    if(n<=2) return n;\n    int a=1,b=2;\n    for(int i=3;i<=n;i++){int c=a+b;a=b;b=c;}\n    return b;\n}` }
    },
    complexity: { brute: { time: "O(2^n)", space: "O(n)" }, optimal: { time: "O(n)", space: "O(1)" } },
    hints: ["This is Fibonacci in disguise!", "How many ways to reach step n? From step n-1 or n-2"]
  },
  {
    id: "best-time-buy-sell", title: "Best Time to Buy and Sell Stock", difficulty: "easy", source: "leetcode", number: 121,
    topics: ["arrays", "sliding-window"], companies: ["Amazon","Microsoft","Meta"],
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    examples: [{ input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy at 1, sell at 6, profit = 5" }],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    solutions: {
      python: { brute: `def maxProfit(prices):\n    max_profit = 0\n    for i in range(len(prices)):\n        for j in range(i+1, len(prices)):\n            max_profit = max(max_profit, prices[j]-prices[i])\n    return max_profit`, optimal: `def maxProfit(prices):\n    min_price = float('inf')\n    max_profit = 0\n    for price in prices:\n        min_price = min(min_price, price)\n        max_profit = max(max_profit, price - min_price)\n    return max_profit` },
      javascript: { brute: `function maxProfit(prices) {\n    let max = 0;\n    for (let i = 0; i < prices.length; i++)\n        for (let j = i+1; j < prices.length; j++)\n            max = Math.max(max, prices[j]-prices[i]);\n    return max;\n}`, optimal: `function maxProfit(prices) {\n    let min = Infinity, max = 0;\n    for (const p of prices) { min = Math.min(min, p); max = Math.max(max, p-min); }\n    return max;\n}` },
      java: { brute: `public int maxProfit(int[] prices) {\n    int max=0;\n    for(int i=0;i<prices.length;i++)\n        for(int j=i+1;j<prices.length;j++)\n            max=Math.max(max,prices[j]-prices[i]);\n    return max;\n}`, optimal: `public int maxProfit(int[] prices) {\n    int min=Integer.MAX_VALUE,max=0;\n    for(int p:prices){min=Math.min(min,p);max=Math.max(max,p-min);}\n    return max;\n}` },
      cpp: { brute: `int maxProfit(vector<int>& prices) {\n    int mx=0;\n    for(int i=0;i<prices.size();i++)\n        for(int j=i+1;j<prices.size();j++)\n            mx=max(mx,prices[j]-prices[i]);\n    return mx;\n}`, optimal: `int maxProfit(vector<int>& prices) {\n    int mn=INT_MAX,mx=0;\n    for(int p:prices){mn=min(mn,p);mx=max(mx,p-mn);}\n    return mx;\n}` }
    },
    complexity: { brute: { time: "O(n²)", space: "O(1)" }, optimal: { time: "O(n)", space: "O(1)" } },
    hints: ["Track the minimum price seen so far", "At each day, calculate profit if we sell today"]
  },
  {
    id: "longest-substring-no-repeat", title: "Longest Substring Without Repeating Characters", difficulty: "medium", source: "leetcode", number: 3,
    topics: ["sliding-window", "strings", "hash-table"], companies: ["Amazon","Google","Microsoft"],
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [{ input: 's = "abcabcbb"', output: "3", explanation: '"abc" has length 3' }],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces"],
    solutions: {
      python: { brute: `def lengthOfLongestSubstring(s):\n    max_len = 0\n    for i in range(len(s)):\n        seen = set()\n        for j in range(i, len(s)):\n            if s[j] in seen: break\n            seen.add(s[j])\n            max_len = max(max_len, j-i+1)\n    return max_len`, optimal: `def lengthOfLongestSubstring(s):\n    char_idx = {}\n    left = max_len = 0\n    for right, ch in enumerate(s):\n        if ch in char_idx and char_idx[ch] >= left:\n            left = char_idx[ch] + 1\n        char_idx[ch] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len` },
      javascript: { brute: `function lengthOfLongestSubstring(s) {\n    let max = 0;\n    for (let i = 0; i < s.length; i++) {\n        const seen = new Set();\n        for (let j = i; j < s.length; j++) {\n            if (seen.has(s[j])) break;\n            seen.add(s[j]); max = Math.max(max, j-i+1);\n        }\n    }\n    return max;\n}`, optimal: `function lengthOfLongestSubstring(s) {\n    const map = new Map(); let left = 0, max = 0;\n    for (let r = 0; r < s.length; r++) {\n        if (map.has(s[r]) && map.get(s[r]) >= left) left = map.get(s[r])+1;\n        map.set(s[r], r);\n        max = Math.max(max, r-left+1);\n    }\n    return max;\n}` },
      java: { brute: `public int lengthOfLongestSubstring(String s) {\n    int max=0;\n    for(int i=0;i<s.length();i++){Set<Character> set=new HashSet<>();for(int j=i;j<s.length();j++){if(set.contains(s.charAt(j)))break;set.add(s.charAt(j));max=Math.max(max,j-i+1);}}\n    return max;\n}`, optimal: `public int lengthOfLongestSubstring(String s) {\n    Map<Character,Integer> map=new HashMap<>();int left=0,max=0;\n    for(int r=0;r<s.length();r++){char c=s.charAt(r);if(map.containsKey(c)&&map.get(c)>=left)left=map.get(c)+1;map.put(c,r);max=Math.max(max,r-left+1);}\n    return max;\n}` },
      cpp: { brute: `int lengthOfLongestSubstring(string s) {\n    int mx=0;\n    for(int i=0;i<s.size();i++){set<char> st;for(int j=i;j<s.size();j++){if(st.count(s[j]))break;st.insert(s[j]);mx=max(mx,j-i+1);}}\n    return mx;\n}`, optimal: `int lengthOfLongestSubstring(string s) {\n    unordered_map<char,int> mp;int left=0,mx=0;\n    for(int r=0;r<s.size();r++){if(mp.count(s[r])&&mp[s[r]]>=left)left=mp[s[r]]+1;mp[s[r]]=r;mx=max(mx,r-left+1);}\n    return mx;\n}` }
    },
    complexity: { brute: { time: "O(n²)", space: "O(min(n,m))" }, optimal: { time: "O(n)", space: "O(min(n,m))" } },
    hints: ["Use a sliding window with two pointers", "Move the left pointer when you encounter a duplicate"]
  },
  {
    id: "binary-search", title: "Binary Search", difficulty: "easy", source: "leetcode", number: 704,
    topics: ["binary-search", "arrays"], companies: ["Google","Amazon","Microsoft"],
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.",
    examples: [{ input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists at index 4" }],
    constraints: ["1 <= nums.length <= 10^4", "All elements in nums are unique", "nums is sorted in ascending order"],
    solutions: {
      python: { brute: `def search(nums, target):\n    for i, num in enumerate(nums):\n        if num == target: return i\n    return -1`, optimal: `def search(nums, target):\n    left, right = 0, len(nums)-1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1` },
      javascript: { brute: `function search(nums, target) {\n    return nums.indexOf(target);\n}`, optimal: `function search(nums, target) {\n    let l = 0, r = nums.length-1;\n    while (l <= r) {\n        const m = Math.floor((l+r)/2);\n        if (nums[m] === target) return m;\n        else if (nums[m] < target) l = m+1;\n        else r = m-1;\n    }\n    return -1;\n}` },
      java: { brute: `public int search(int[] nums, int target) {\n    for(int i=0;i<nums.length;i++) if(nums[i]==target) return i;\n    return -1;\n}`, optimal: `public int search(int[] nums, int target) {\n    int l=0,r=nums.length-1;\n    while(l<=r){int m=(l+r)/2;if(nums[m]==target)return m;else if(nums[m]<target)l=m+1;else r=m-1;}\n    return -1;\n}` },
      cpp: { brute: `int search(vector<int>& nums, int target) {\n    for(int i=0;i<nums.size();i++) if(nums[i]==target) return i;\n    return -1;\n}`, optimal: `int search(vector<int>& nums, int target) {\n    int l=0,r=nums.size()-1;\n    while(l<=r){int m=(l+r)/2;if(nums[m]==target)return m;else if(nums[m]<target)l=m+1;else r=m-1;}\n    return -1;\n}` }
    },
    complexity: { brute: { time: "O(n)", space: "O(1)" }, optimal: { time: "O(log n)", space: "O(1)" } },
    hints: ["The array is sorted — use this to eliminate half the search space", "Compare mid element to target: go left or right"]
  },
  {
    id: "reverse-linked-list", title: "Reverse Linked List", difficulty: "easy", source: "leetcode", number: 206,
    topics: ["linked-list"], companies: ["Amazon","Google","Facebook"],
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "List reversed" }],
    constraints: ["The number of nodes in the list is the range [0, 5000]"],
    solutions: {
      python: { brute: `def reverseList(head):\n    nodes = []\n    curr = head\n    while curr:\n        nodes.append(curr.val)\n        curr = curr.next\n    curr = head\n    for val in reversed(nodes):\n        curr.val = val\n        curr = curr.next\n    return head`, optimal: `def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev` },
      javascript: { brute: `function reverseList(head) {\n    let vals = [], curr = head;\n    while (curr) { vals.push(curr.val); curr = curr.next; }\n    curr = head;\n    for (const v of vals.reverse()) { curr.val = v; curr = curr.next; }\n    return head;\n}`, optimal: `function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        const nxt = curr.next;\n        curr.next = prev;\n        prev = curr; curr = nxt;\n    }\n    return prev;\n}` },
      java: { brute: `public ListNode reverseList(ListNode head) {\n    ListNode prev=null,curr=head;\n    while(curr!=null){ListNode nxt=curr.next;curr.next=prev;prev=curr;curr=nxt;}\n    return prev;\n}`, optimal: `public ListNode reverseList(ListNode head) {\n    ListNode prev=null,curr=head;\n    while(curr!=null){ListNode nxt=curr.next;curr.next=prev;prev=curr;curr=nxt;}\n    return prev;\n}` },
      cpp: { brute: `ListNode* reverseList(ListNode* head) {\n    ListNode *prev=nullptr,*curr=head;\n    while(curr){ListNode *nxt=curr->next;curr->next=prev;prev=curr;curr=nxt;}\n    return prev;\n}`, optimal: `ListNode* reverseList(ListNode* head) {\n    ListNode *prev=nullptr,*curr=head;\n    while(curr){ListNode *nxt=curr->next;curr->next=prev;prev=curr;curr=nxt;}\n    return prev;\n}` }
    },
    complexity: { brute: { time: "O(n)", space: "O(n)" }, optimal: { time: "O(n)", space: "O(1)" } },
    hints: ["You need three pointers: prev, curr, next", "At each step, reverse the current link then advance all pointers"]
  },
  {
    id: "container-most-water", title: "Container With Most Water", difficulty: "medium", source: "leetcode", number: 11,
    topics: ["two-pointers", "arrays"], companies: ["Amazon","Google","Goldman Sachs"],
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    examples: [{ input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "Lines at index 1 and 8 contain 49 units of water" }],
    constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    solutions: {
      python: { brute: `def maxArea(height):\n    max_water = 0\n    for i in range(len(height)):\n        for j in range(i+1, len(height)):\n            max_water = max(max_water, min(height[i],height[j]) * (j-i))\n    return max_water`, optimal: `def maxArea(height):\n    left, right = 0, len(height)-1\n    max_water = 0\n    while left < right:\n        water = min(height[left], height[right]) * (right - left)\n        max_water = max(max_water, water)\n        if height[left] < height[right]: left += 1\n        else: right -= 1\n    return max_water` },
      javascript: { brute: `function maxArea(height) {\n    let max = 0;\n    for (let i = 0; i < height.length; i++)\n        for (let j = i+1; j < height.length; j++)\n            max = Math.max(max, Math.min(height[i],height[j])*(j-i));\n    return max;\n}`, optimal: `function maxArea(height) {\n    let l = 0, r = height.length-1, max = 0;\n    while (l < r) {\n        max = Math.max(max, Math.min(height[l],height[r])*(r-l));\n        height[l] < height[r] ? l++ : r--;\n    }\n    return max;\n}` },
      java: { brute: `public int maxArea(int[] h) {\n    int max=0;\n    for(int i=0;i<h.length;i++) for(int j=i+1;j<h.length;j++) max=Math.max(max,Math.min(h[i],h[j])*(j-i));\n    return max;\n}`, optimal: `public int maxArea(int[] h) {\n    int l=0,r=h.length-1,max=0;\n    while(l<r){max=Math.max(max,Math.min(h[l],h[r])*(r-l));if(h[l]<h[r])l++;else r--;}\n    return max;\n}` },
      cpp: { brute: `int maxArea(vector<int>& h) {\n    int mx=0;\n    for(int i=0;i<h.size();i++) for(int j=i+1;j<h.size();j++) mx=max(mx,min(h[i],h[j])*(j-i));\n    return mx;\n}`, optimal: `int maxArea(vector<int>& h) {\n    int l=0,r=h.size()-1,mx=0;\n    while(l<r){mx=max(mx,min(h[l],h[r])*(r-l));if(h[l]<h[r])l++;else r--;}\n    return mx;\n}` }
    },
    complexity: { brute: { time: "O(n²)", space: "O(1)" }, optimal: { time: "O(n)", space: "O(1)" } },
    hints: ["Start with the widest container (two ends)", "Move the pointer with the shorter height inward — why?"]
  },
  {
    id: "number-of-islands", title: "Number of Islands", difficulty: "medium", source: "leetcode", number: 200,
    topics: ["graphs", "dfs", "bfs"], companies: ["Amazon","Google","Microsoft"],
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    examples: [{ input: 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]', output: "2", explanation: "2 separate islands" }],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", 'grid[i][j] is "0" or "1"'],
    solutions: {
      python: { brute: `def numIslands(grid):\n    # DFS solution\n    def dfs(i, j):\n        if i<0 or i>=len(grid) or j<0 or j>=len(grid[0]) or grid[i][j]!='1': return\n        grid[i][j] = '0'\n        dfs(i+1,j); dfs(i-1,j); dfs(i,j+1); dfs(i,j-1)\n    count = 0\n    for i in range(len(grid)):\n        for j in range(len(grid[0])):\n            if grid[i][j]=='1':\n                count += 1\n                dfs(i, j)\n    return count`, optimal: `def numIslands(grid):\n    def dfs(i, j):\n        if i<0 or i>=len(grid) or j<0 or j>=len(grid[0]) or grid[i][j]!='1': return\n        grid[i][j] = '0'\n        dfs(i+1,j); dfs(i-1,j); dfs(i,j+1); dfs(i,j-1)\n    count = 0\n    for i in range(len(grid)):\n        for j in range(len(grid[0])):\n            if grid[i][j]=='1': count += 1; dfs(i, j)\n    return count` },
      javascript: { brute: `function numIslands(grid) {\n    function dfs(i,j) {\n        if(i<0||i>=grid.length||j<0||j>=grid[0].length||grid[i][j]!=='1') return;\n        grid[i][j]='0';\n        dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);\n    }\n    let count=0;\n    for(let i=0;i<grid.length;i++)\n        for(let j=0;j<grid[0].length;j++)\n            if(grid[i][j]==='1'){count++;dfs(i,j);}\n    return count;\n}`, optimal: `function numIslands(grid) {\n    function dfs(i,j){if(i<0||i>=grid.length||j<0||j>=grid[0].length||grid[i][j]!=='1')return;grid[i][j]='0';dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);}\n    let c=0;\n    for(let i=0;i<grid.length;i++) for(let j=0;j<grid[0].length;j++) if(grid[i][j]==='1'){c++;dfs(i,j);}\n    return c;\n}` },
      java: { brute: `public int numIslands(char[][] grid) {\n    int count=0;\n    for(int i=0;i<grid.length;i++) for(int j=0;j<grid[0].length;j++) if(grid[i][j]=='1'){count++;dfs(grid,i,j);}\n    return count;\n}\nvoid dfs(char[][] g,int i,int j){if(i<0||i>=g.length||j<0||j>=g[0].length||g[i][j]!='1')return;g[i][j]='0';dfs(g,i+1,j);dfs(g,i-1,j);dfs(g,i,j+1);dfs(g,i,j-1);}`, optimal: `// Same O(m*n) — DFS is already optimal\npublic int numIslands(char[][] grid) {\n    int count=0;\n    for(int i=0;i<grid.length;i++) for(int j=0;j<grid[0].length;j++) if(grid[i][j]=='1'){count++;dfs(grid,i,j);}\n    return count;\n}\nvoid dfs(char[][] g,int i,int j){if(i<0||i>=g.length||j<0||j>=g[0].length||g[i][j]!='1')return;g[i][j]='0';dfs(g,i+1,j);dfs(g,i-1,j);dfs(g,i,j+1);dfs(g,i,j-1);}` },
      cpp: { brute: `void dfs(vector<vector<char>>& g,int i,int j){if(i<0||i>=g.size()||j<0||j>=g[0].size()||g[i][j]!='1')return;g[i][j]='0';dfs(g,i+1,j);dfs(g,i-1,j);dfs(g,i,j+1);dfs(g,i,j-1);}\nint numIslands(vector<vector<char>>& grid){int c=0;for(int i=0;i<grid.size();i++) for(int j=0;j<grid[0].size();j++) if(grid[i][j]=='1'){c++;dfs(grid,i,j);}return c;}`, optimal: `void dfs(vector<vector<char>>& g,int i,int j){if(i<0||i>=g.size()||j<0||j>=g[0].size()||g[i][j]!='1')return;g[i][j]='0';dfs(g,i+1,j);dfs(g,i-1,j);dfs(g,i,j+1);dfs(g,i,j-1);}\nint numIslands(vector<vector<char>>& grid){int c=0;for(int i=0;i<grid.size();i++) for(int j=0;j<grid[0].size();j++) if(grid[i][j]=='1'){c++;dfs(grid,i,j);}return c;}` }
    },
    complexity: { brute: { time: "O(m×n)", space: "O(m×n)" }, optimal: { time: "O(m×n)", space: "O(m×n)" } },
    hints: ["For each unvisited land cell, start a DFS/BFS to mark the whole island", "Mark visited cells to avoid counting the same island twice"]
  },
  {
    id: "coin-change", title: "Coin Change", difficulty: "medium", source: "leetcode", number: 322,
    topics: ["dynamic-programming"], companies: ["Amazon","Google","Microsoft"],
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
    examples: [{ input: "coins = [1,5,11], amount = 15", output: "3", explanation: "11+3*1=14? No. 11+4=15 → 2 coins. Actually 5+5+5=15 → 3, or 11+1+1+1+1=15 → 5. Min is 3 coins: 5+5+5" }],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    solutions: {
      python: { brute: `def coinChange(coins, amount):\n    def dp(n):\n        if n==0: return 0\n        if n<0: return float('inf')\n        return 1+min(dp(n-c) for c in coins)\n    res=dp(amount)\n    return res if res!=float('inf') else -1`, optimal: `def coinChange(coins, amount):\n    dp = [float('inf')] * (amount+1)\n    dp[0] = 0\n    for i in range(1, amount+1):\n        for coin in coins:\n            if coin <= i:\n                dp[i] = min(dp[i], dp[i-coin]+1)\n    return dp[amount] if dp[amount]!=float('inf') else -1` },
      javascript: { brute: `function coinChange(coins, amount) {\n    const dp = new Array(amount+1).fill(Infinity);\n    dp[0] = 0;\n    for (let i = 1; i <= amount; i++)\n        for (const c of coins)\n            if (c <= i && dp[i-c]+1 < dp[i]) dp[i] = dp[i-c]+1;\n    return dp[amount] === Infinity ? -1 : dp[amount];\n}`, optimal: `function coinChange(coins, amount) {\n    const dp = new Array(amount+1).fill(Infinity);\n    dp[0] = 0;\n    for (let i = 1; i <= amount; i++)\n        for (const c of coins)\n            if (c <= i) dp[i] = Math.min(dp[i], dp[i-c]+1);\n    return dp[amount] === Infinity ? -1 : dp[amount];\n}` },
      java: { brute: `public int coinChange(int[] coins, int amount) {\n    int[] dp=new int[amount+1];\n    Arrays.fill(dp, amount+1);\n    dp[0]=0;\n    for(int i=1;i<=amount;i++) for(int c:coins) if(c<=i) dp[i]=Math.min(dp[i],dp[i-c]+1);\n    return dp[amount]>amount?-1:dp[amount];\n}`, optimal: `public int coinChange(int[] coins, int amount) {\n    int[] dp=new int[amount+1];\n    Arrays.fill(dp, amount+1);\n    dp[0]=0;\n    for(int i=1;i<=amount;i++) for(int c:coins) if(c<=i) dp[i]=Math.min(dp[i],dp[i-c]+1);\n    return dp[amount]>amount?-1:dp[amount];\n}` },
      cpp: { brute: `int coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount+1, INT_MAX);\n    dp[0]=0;\n    for(int i=1;i<=amount;i++) for(int c:coins) if(c<=i&&dp[i-c]!=INT_MAX) dp[i]=min(dp[i],dp[i-c]+1);\n    return dp[amount]==INT_MAX?-1:dp[amount];\n}`, optimal: `int coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount+1, INT_MAX);\n    dp[0]=0;\n    for(int i=1;i<=amount;i++) for(int c:coins) if(c<=i&&dp[i-c]!=INT_MAX) dp[i]=min(dp[i],dp[i-c]+1);\n    return dp[amount]==INT_MAX?-1:dp[amount];\n}` }
    },
    complexity: { brute: { time: "O(amount × coins)", space: "O(amount)" }, optimal: { time: "O(amount × coins)", space: "O(amount)" } },
    hints: ["Build dp[i] = minimum coins to make amount i", "For each amount, try every coin denomination"]
  },
  {
    id: "house-robber", title: "House Robber", difficulty: "medium", source: "leetcode", number: 198,
    topics: ["dynamic-programming"], companies: ["Amazon","Google","Airbnb"],
    description: "You are a professional robber. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police (cannot rob adjacent houses).",
    examples: [{ input: "nums = [2,7,9,3,1]", output: "12", explanation: "Rob houses 1,3,5 → 2+9+1=12" }],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    solutions: {
      python: { brute: `def rob(nums):\n    # Recursive with memo\n    from functools import lru_cache\n    @lru_cache(None)\n    def dp(i):\n        if i >= len(nums): return 0\n        return max(nums[i]+dp(i+2), dp(i+1))\n    return dp(0)`, optimal: `def rob(nums):\n    prev2 = prev1 = 0\n    for num in nums:\n        prev2, prev1 = prev1, max(prev1, prev2+num)\n    return prev1` },
      javascript: { brute: `function rob(nums) {\n    const memo = {};\n    function dp(i) {\n        if (i >= nums.length) return 0;\n        if (memo[i] !== undefined) return memo[i];\n        return memo[i] = Math.max(nums[i]+dp(i+2), dp(i+1));\n    }\n    return dp(0);\n}`, optimal: `function rob(nums) {\n    let a = 0, b = 0;\n    for (const n of nums) [a, b] = [b, Math.max(b, a+n)];\n    return b;\n}` },
      java: { brute: `public int rob(int[] nums) {\n    int a=0,b=0;\n    for(int n:nums){int c=Math.max(b,a+n);a=b;b=c;}\n    return b;\n}`, optimal: `public int rob(int[] nums) {\n    int a=0,b=0;\n    for(int n:nums){int c=Math.max(b,a+n);a=b;b=c;}\n    return b;\n}` },
      cpp: { brute: `int rob(vector<int>& nums) {\n    int a=0,b=0;\n    for(int n:nums){int c=max(b,a+n);a=b;b=c;}\n    return b;\n}`, optimal: `int rob(vector<int>& nums) {\n    int a=0,b=0;\n    for(int n:nums){int c=max(b,a+n);a=b;b=c;}\n    return b;\n}` }
    },
    complexity: { brute: { time: "O(n)", space: "O(n)" }, optimal: { time: "O(n)", space: "O(1)" } },
    hints: ["For each house: rob it + dp[i-2] OR skip it + dp[i-1]", "You only need the last two values — use O(1) space"]
  },
  {
    id: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "easy", source: "leetcode", number: 226,
    topics: ["trees", "recursion"], companies: ["Google","Amazon","Microsoft"],
    description: "Given the root of a binary tree, invert the tree, and return its root.",
    examples: [{ input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]", explanation: "Mirror image of the tree" }],
    constraints: ["The number of nodes in the tree is in the range [0, 100]"],
    solutions: {
      python: { brute: `def invertTree(root):\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root`, optimal: `def invertTree(root):\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root` },
      javascript: { brute: `function invertTree(root) {\n    if (!root) return null;\n    [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];\n    return root;\n}`, optimal: `function invertTree(root) {\n    if (!root) return null;\n    [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];\n    return root;\n}` },
      java: { brute: `public TreeNode invertTree(TreeNode root) {\n    if(root==null) return null;\n    TreeNode t=invertTree(root.left);\n    root.left=invertTree(root.right);\n    root.right=t;\n    return root;\n}`, optimal: `public TreeNode invertTree(TreeNode root) {\n    if(root==null) return null;\n    TreeNode t=invertTree(root.left);\n    root.left=invertTree(root.right);\n    root.right=t;\n    return root;\n}` },
      cpp: { brute: `TreeNode* invertTree(TreeNode* root) {\n    if(!root) return nullptr;\n    swap(root->left, root->right);\n    invertTree(root->left);\n    invertTree(root->right);\n    return root;\n}`, optimal: `TreeNode* invertTree(TreeNode* root) {\n    if(!root) return nullptr;\n    swap(root->left, root->right);\n    invertTree(root->left);\n    invertTree(root->right);\n    return root;\n}` }
    },
    complexity: { brute: { time: "O(n)", space: "O(h)" }, optimal: { time: "O(n)", space: "O(h)" } },
    hints: ["Recursively swap left and right subtrees", "Base case: null node returns null"]
  },
  {
    id: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "hard", source: "leetcode", number: 42,
    topics: ["two-pointers", "arrays", "dynamic-programming"], companies: ["Amazon","Google","Microsoft"],
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "6 units of rain water trapped" }],
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    solutions: {
      python: { brute: `def trap(height):\n    n = len(height)\n    water = 0\n    for i in range(n):\n        left_max = max(height[:i+1])\n        right_max = max(height[i:])\n        water += min(left_max, right_max) - height[i]\n    return water`, optimal: `def trap(height):\n    left, right = 0, len(height)-1\n    left_max = right_max = 0\n    water = 0\n    while left < right:\n        if height[left] < height[right]:\n            if height[left] >= left_max: left_max = height[left]\n            else: water += left_max - height[left]\n            left += 1\n        else:\n            if height[right] >= right_max: right_max = height[right]\n            else: water += right_max - height[right]\n            right -= 1\n    return water` },
      javascript: { brute: `function trap(height) {\n    let water = 0;\n    for (let i = 0; i < height.length; i++) {\n        const lm = Math.max(...height.slice(0,i+1));\n        const rm = Math.max(...height.slice(i));\n        water += Math.min(lm,rm) - height[i];\n    }\n    return water;\n}`, optimal: `function trap(height) {\n    let l=0,r=height.length-1,lm=0,rm=0,w=0;\n    while(l<r){\n        if(height[l]<height[r]){height[l]>=lm?lm=height[l]:w+=lm-height[l];l++;}\n        else{height[r]>=rm?rm=height[r]:w+=rm-height[r];r--;}\n    }\n    return w;\n}` },
      java: { brute: `public int trap(int[] h) {\n    int n=h.length,w=0;\n    for(int i=0;i<n;i++){int lm=0,rm=0;for(int j=0;j<=i;j++)lm=Math.max(lm,h[j]);for(int j=i;j<n;j++)rm=Math.max(rm,h[j]);w+=Math.min(lm,rm)-h[i];}\n    return w;\n}`, optimal: `public int trap(int[] h) {\n    int l=0,r=h.length-1,lm=0,rm=0,w=0;\n    while(l<r){if(h[l]<h[r]){if(h[l]>=lm)lm=h[l];else w+=lm-h[l];l++;}else{if(h[r]>=rm)rm=h[r];else w+=rm-h[r];r--)}\n    return w;\n}` },
      cpp: { brute: `int trap(vector<int>& h) {\n    int n=h.size(),w=0;\n    for(int i=0;i<n;i++){int lm=*max_element(h.begin(),h.begin()+i+1);int rm=*max_element(h.begin()+i,h.end());w+=min(lm,rm)-h[i];}\n    return w;\n}`, optimal: `int trap(vector<int>& h) {\n    int l=0,r=h.size()-1,lm=0,rm=0,w=0;\n    while(l<r){if(h[l]<h[r]){h[l]>=lm?lm=h[l]:w+=lm-h[l];l++;}else{h[r]>=rm?rm=h[r]:w+=rm-h[r];r--;}}\n    return w;\n}` }
    },
    complexity: { brute: { time: "O(n²)", space: "O(1)" }, optimal: { time: "O(n)", space: "O(1)" } },
    hints: ["Water at position i = min(maxLeft, maxRight) - height[i]", "Use two pointers: process from the side with smaller max boundary"]
  },
  {
    id: "merge-intervals", title: "Merge Intervals", difficulty: "medium", source: "leetcode", number: 56,
    topics: ["arrays", "sorting"], companies: ["Google","Amazon","Facebook"],
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals.",
    examples: [{ input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "[1,3] and [2,6] overlap → merged to [1,6]" }],
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2"],
    solutions: {
      python: { brute: `def merge(intervals):\n    intervals.sort()\n    merged = [intervals[0]]\n    for start, end in intervals[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged`, optimal: `def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for start, end in intervals[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged` },
      javascript: { brute: `function merge(intervals) {\n    intervals.sort((a,b)=>a[0]-b[0]);\n    const res = [intervals[0]];\n    for (let i=1;i<intervals.length;i++) {\n        if (intervals[i][0] <= res[res.length-1][1])\n            res[res.length-1][1] = Math.max(res[res.length-1][1], intervals[i][1]);\n        else res.push(intervals[i]);\n    }\n    return res;\n}`, optimal: `function merge(intervals) {\n    intervals.sort((a,b)=>a[0]-b[0]);\n    const res=[intervals[0]];\n    for(let i=1;i<intervals.length;i++){if(intervals[i][0]<=res[res.length-1][1])res[res.length-1][1]=Math.max(res[res.length-1][1],intervals[i][1]);else res.push(intervals[i]);}\n    return res;\n}` },
      java: { brute: `public int[][] merge(int[][] intervals) {\n    Arrays.sort(intervals,(a,b)->a[0]-b[0]);\n    List<int[]> res=new ArrayList<>();\n    res.add(intervals[0]);\n    for(int i=1;i<intervals.length;i++){int[] last=res.get(res.size()-1);if(intervals[i][0]<=last[1])last[1]=Math.max(last[1],intervals[i][1]);else res.add(intervals[i]);}\n    return res.toArray(new int[0][]);\n}`, optimal: `public int[][] merge(int[][] intervals) {\n    Arrays.sort(intervals,(a,b)->a[0]-b[0]);\n    List<int[]> res=new ArrayList<>();res.add(intervals[0]);\n    for(int i=1;i<intervals.length;i++){int[] last=res.get(res.size()-1);if(intervals[i][0]<=last[1])last[1]=Math.max(last[1],intervals[i][1]);else res.add(intervals[i]);}\n    return res.toArray(new int[0][]);\n}` },
      cpp: { brute: `vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    sort(intervals.begin(),intervals.end());\n    vector<vector<int>> res={intervals[0]};\n    for(int i=1;i<intervals.size();i++){if(intervals[i][0]<=res.back()[1])res.back()[1]=max(res.back()[1],intervals[i][1]);else res.push_back(intervals[i]);}\n    return res;\n}`, optimal: `vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    sort(intervals.begin(),intervals.end());\n    vector<vector<int>> res={intervals[0]};\n    for(int i=1;i<intervals.size();i++){if(intervals[i][0]<=res.back()[1])res.back()[1]=max(res.back()[1],intervals[i][1]);else res.push_back(intervals[i]);}\n    return res;\n}` }
    },
    complexity: { brute: { time: "O(n log n)", space: "O(n)" }, optimal: { time: "O(n log n)", space: "O(n)" } },
    hints: ["Sort by start time first", "Merge current interval with result's last if they overlap"]
  }
];

const TOPICS = [
  { id: "arrays", name: "Arrays & Hashing", icon: "📊", color: "#667eea", description: "Master array manipulation and hash maps", prerequisites: [], difficulty: "beginner", order: 1, problemIds: ["two-sum","best-time-buy-sell","maximum-subarray","trapping-rain-water","merge-intervals"] },
  { id: "two-pointers", name: "Two Pointers", icon: "👆", color: "#f093fb", description: "Efficient pointer techniques for arrays", prerequisites: ["arrays"], difficulty: "beginner", order: 2, problemIds: ["container-most-water","trapping-rain-water"] },
  { id: "sliding-window", name: "Sliding Window", icon: "🪟", color: "#4facfe", description: "Optimal subarray and substring problems", prerequisites: ["two-pointers"], difficulty: "beginner", order: 3, problemIds: ["longest-substring-no-repeat","best-time-buy-sell"] },
  { id: "stack", name: "Stack", icon: "📚", color: "#43e97b", description: "LIFO data structure and applications", prerequisites: ["arrays"], difficulty: "beginner", order: 4, problemIds: ["valid-parentheses"] },
  { id: "binary-search", name: "Binary Search", icon: "🔍", color: "#fa709a", description: "Divide and conquer search technique", prerequisites: ["arrays"], difficulty: "beginner", order: 5, problemIds: ["binary-search"] },
  { id: "linked-list", name: "Linked Lists", icon: "🔗", color: "#a18cd1", description: "Linear data structure with pointers", prerequisites: ["arrays"], difficulty: "intermediate", order: 6, problemIds: ["reverse-linked-list"] },
  { id: "trees", name: "Trees", icon: "🌳", color: "#fbc2eb", description: "Hierarchical data structure", prerequisites: ["linked-list","recursion"], difficulty: "intermediate", order: 7, problemIds: ["invert-binary-tree"] },
  { id: "graphs", name: "Graphs", icon: "🕸️", color: "#a1c4fd", description: "Networks of nodes and edges", prerequisites: ["trees"], difficulty: "intermediate", order: 8, problemIds: ["number-of-islands"] },
  { id: "dynamic-programming", name: "Dynamic Programming", icon: "🧩", color: "#ffecd2", description: "Optimal substructure and memoization", prerequisites: ["recursion"], difficulty: "advanced", order: 9, problemIds: ["climbing-stairs","maximum-subarray","coin-change","house-robber"] },
  { id: "backtracking", name: "Backtracking", icon: "🔙", color: "#a8edea", description: "Systematic trial and error", prerequisites: ["recursion"], difficulty: "advanced", order: 10, problemIds: [] },
  { id: "heap", name: "Heap / Priority Queue", icon: "🏔️", color: "#fed6e3", description: "Priority-based data structure", prerequisites: ["trees"], difficulty: "advanced", order: 11, problemIds: [] },
  { id: "trie", name: "Tries", icon: "🌐", color: "#d299c2", description: "Prefix tree for string operations", prerequisites: ["trees"], difficulty: "advanced", order: 12, problemIds: [] },
  { id: "recursion", name: "Recursion", icon: "🔄", color: "#89f7fe", description: "Functions calling themselves", prerequisites: [], difficulty: "beginner", order: 0, problemIds: ["climbing-stairs","invert-binary-tree"] },
];

class ProblemService {
  constructor() {
    this.problems = PROBLEMS;
    this.topics = TOPICS;
  }

  getAll() { return this.problems; }

  getById(id) { return this.problems.find(p => p.id === id); }

  search(query) {
    if (!query) return this.problems;
    const q = query.toLowerCase();
    return this.problems.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.topics.some(t => t.includes(q)) ||
      p.description.toLowerCase().includes(q) ||
      (p.companies || []).some(c => c.toLowerCase().includes(q))
    );
  }

  filterByTopic(topic) {
    if (!topic || topic === 'all') return this.problems;
    return this.problems.filter(p => p.topics.includes(topic));
  }

  filterByDifficulty(difficulty) {
    if (!difficulty || difficulty === 'all') return this.problems;
    return this.problems.filter(p => p.difficulty === difficulty);
  }

  filterByStatus(status, solvedIds = []) {
    if (status === 'solved') return this.problems.filter(p => solvedIds.includes(p.id));
    if (status === 'unsolved') return this.problems.filter(p => !solvedIds.includes(p.id));
    return this.problems;
  }

  filter({ topic, difficulty, status, query, solvedIds }) {
    let results = this.problems;
    if (query) results = this.search(query);
    if (topic && topic !== 'all') results = results.filter(p => p.topics.includes(topic));
    if (difficulty && difficulty !== 'all') results = results.filter(p => p.difficulty === difficulty);
    if (status === 'solved') results = results.filter(p => (solvedIds || []).includes(p.id));
    if (status === 'unsolved') results = results.filter(p => !(solvedIds || []).includes(p.id));
    return results;
  }

  getTopics() { return this.topics; }

  getTopicById(id) { return this.topics.find(t => t.id === id); }

  getRelatedProblems(problemId) {
    const problem = this.getById(problemId);
    if (!problem) return [];
    return this.problems.filter(p => p.id !== problemId && p.topics.some(t => problem.topics.includes(t))).slice(0, 5);
  }

  getRandomProblem(filters = {}) {
    const filtered = this.filter(filters);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  parseProblemUrl(url) {
    // Try to extract problem title from LeetCode or GFG URLs
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('leetcode.com')) {
        const parts = parsed.pathname.split('/').filter(Boolean);
        const idx = parts.indexOf('problems');
        if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
      }
      if (parsed.hostname.includes('geeksforgeeks.org')) {
        const parts = parsed.pathname.split('/').filter(Boolean);
        const idx = parts.indexOf('problems');
        if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
        return parts[parts.length - 1] || null;
      }
    } catch (e) {}
    return null;
  }
}

export const problemService = new ProblemService();
