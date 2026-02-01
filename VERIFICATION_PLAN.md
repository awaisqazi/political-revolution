
- [x] Integrate `useGameLoop` toast notifications <!-- id: 18 -->

Verification Plan:
1. Start Dev Server.
2. Check if BackgroundLayer loads.
3. Check if Scrapbook button opens modal.
4. Unlock "The Spark" (Volunteers >= 10).
    - Canvass until 10 volunteers (or use console).
    - Verify Toast appears: "New Memory Unlocked: The Spark".
    - Open Scrapbook -> "The Beginning" should be unlocked.
    - Click it -> Lightbox opens.
5. Win election (City Council -> State Rep).
    - Check if background changes to `bg-state.jpg`.
    - Check if "First Win" memory unlocks.
