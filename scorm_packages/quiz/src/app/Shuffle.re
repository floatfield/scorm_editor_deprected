let take: (int, list('a)) => list('a) = (index, xs) => {
    let rec loop = (acc, takeN, xs) =>
        takeN == 0 || List.length(xs) == 0 ? List.rev(acc) : loop([List.hd(xs), ...acc], takeN - 1, List.tl(xs));
    loop([], index, xs);
};

let rec drop: (int, list('a)) => list('a) = (index, xs) =>
    index == 0 ? xs : drop(index - 1, List.tl(xs));

let dropAt: (int, list('a)) => list('a) = (n, xs) =>
    take(n, xs) @ drop(n + 1, xs);

let shuffle: list('a) => list('a) = xs => {
    let rec loop = (acc, xs) => {
        let l = List.length(xs);
        if (l == 0) {
            acc
        } else {
            let index = Random.int(l);
            loop([List.nth(xs, index), ...acc], dropAt(index, xs));
        }
    };
    loop([], xs);
};

let pickNRandom: (int, list('a)) => list('a) = (m, xs) => {
    let n = min(m, List.length(xs));
    shuffle(xs)
    |> take(n);
};

let initial: list('a) => list('a) = xs =>
    take(max(0, List.length(xs) - 1), xs);

let last: list('a) => 'a = xs =>
    List.nth(xs, List.length(xs) - 1);