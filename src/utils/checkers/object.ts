type EmptyCheckOptions = {
  deep?: boolean;
};

type Obj = Record<string, unknown>;

export const hasEmptyKey = (obj: Obj, options: EmptyCheckOptions = {}): boolean => {
  return Object.values(obj).some((value) => {
    const { deep = false } = options;

    const isEmpty =
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (isEmpty) return true;

    return deep && typeof value === "object" && !Array.isArray(value)
      ? hasEmptyKey(value as Obj, { deep })
      : false;
  });
};
