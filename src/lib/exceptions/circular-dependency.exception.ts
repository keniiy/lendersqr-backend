export class CircularDependencyException extends Error {
  /**
   * Constructs a CircularDependencyException with an optional context.
   *
   * @param context - A string providing context about where the circular dependency was detected.
   */
  constructor(context?: string) {
    const ctx = context ? ` inside ${context}` : ``;
    super(
      `A circular dependency has been detected${ctx}. Please, make sure that each side of a bidirectional relationships are decorated with "forwardRef()". Also, try to eliminate barrel files because they can lead to an unexpected behavior too.`,
    );
  }
}
